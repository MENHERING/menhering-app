-- 아바타 감정 감쇠(lazy settle): 조회 시 마지막 정산 이후 경과분을 계산해 mood_value를 깎고 되쓴다.
-- 적용은 기존 파일들과 동일하게 대시보드 SQL 에디터로 한다(이 파일은 리뷰·이력용).
--
-- 왜 트리거가 아니라 RPC인가:
--   감쇠는 "시간이 지나 조회할 때" 반영돼야 하는데 Postgres에는 SELECT(읽기) 트리거가 없다.
--   시간이 흐르는 동안엔 쓰기 이벤트가 없어 트리거가 발동할 계기 자체가 없다. 그래서 조회 함수가
--   읽으면서 정산(settle)하고 그 값을 UPDATE로 되쓴다. SECURITY DEFINER라 avatar_status에 별도
--   UPDATE 정책 없이 owner 권한으로 쓴다(buy_avatar_item이 avatar_inventory에 쓰는 것과 동일 패턴).
--
-- 감쇠율(서버 권위): 25/일. mood_value 100(만땅)→0까지 4일, 보통(60)→0까지 약 2.4일.
--   발표 데모 때 변화를 빨리 보이려면 아래 _mood_decay_per_day() 반환값만 키운다(코드 한 곳).
--
-- 부분 하루 처리(연속식): 깎임 = floor(경과일수 × 감쇠율). avatar_status에는 updated_at을 now()로
--   강제하는 BEFORE UPDATE 트리거(trg_avatar_status_updated_at → set_updated_at)가 있어, 감쇠 write 시
--   updated_at은 트리거에 맡기고 함수는 mood_value만 쓴다(명시해도 덮인다). "1포인트 미만이면 write하지
--   않음" 가드가 잔여 이월 역할을 한다: 안 쓰면 기준점(updated_at)이 유지돼 다음 조회가 누적을 이어간다.
--   1포인트 이상 깎이는 순간엔 now()로 리셋돼 하루 미만 잔여가 사라지지만, 25/일 기준 1pt≈58분이라
--   실사용(하루 1~2회 접속)에선 무시할 수준. 정확한 이월이 필요하면 트리거가 안 건드리는 전용 컬럼
--   (mood_settled_at)으로 감쇠 기준을 분리한다.

-- ── 감쇠율(서버 권위, 단일 출처) ────────────────────────────────────────────
create or replace function public._mood_decay_per_day()
returns integer
language sql
immutable
as $$
  select 25;
$$;

-- ── 감정 상태 조회 + lazy 감쇠 정산 ─────────────────────────────────────────
-- 본인 아바타의 avatar_status 행(uq_avatars_user로 유저당 1개)을 auth.uid()로 찾아, 경과분만큼
-- 깎은 최신 mood_value·updated_at을 돌려준다. 상태행이 없거나(신규) 미인증이면 빈 결과를 반환하고,
-- route handler가 기본값(DEFAULT_MOOD_VALUE=60)으로 폴백한다.
create or replace function public.get_avatar_status()
returns table (mood_value integer, updated_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user     uuid := auth.uid();
  v_rate     integer := public._mood_decay_per_day();
  v_mood     integer;
  v_updated  timestamptz;
  v_elapsed  double precision;
  v_decay    integer;
  v_new_mood integer;
begin
  if v_user is null then
    return; -- 미인증: 빈 결과 → route가 기본값 폴백
  end if;

  select s.mood_value, s.updated_at
    into v_mood, v_updated
  from public.avatar_status s
  join public.avatars a on a.id = s.avatar_id
  where a.user_id = v_user
  limit 1;

  if not found then
    return; -- 상태행 없음(신규 유저): 빈 결과 → route가 기본값 폴백
  end if;

  -- 경과 일수(연속) → 깎을 정수 포인트.
  v_elapsed := extract(epoch from (now() - v_updated)) / 86400.0;
  v_decay := floor(v_elapsed * v_rate)::integer;

  -- 이미 바닥(0)이거나 아직 1포인트도 안 깎였으면 되쓰지 않는다. 이 가드가 잔여 이월 역할을 한다
  -- (안 쓰면 updated_at 기준점 유지 → 다음 조회가 누적 지속). write 시 updated_at은 BEFORE UPDATE
  -- 트리거(set_updated_at)가 now()로 갱신하므로 여기선 mood_value만 쓴다.
  if v_decay >= 1 and v_mood > 0 then
    v_new_mood := greatest(0, v_mood - v_decay);

    update public.avatar_status s
    set mood_value = v_new_mood
    from public.avatars a
    where s.avatar_id = a.id
      and a.user_id = v_user;

    v_mood := v_new_mood;
    v_updated := now(); -- 트리거가 쓴 값과 동일(같은 트랜잭션 now())
  end if;

  mood_value := v_mood;
  updated_at := v_updated;
  return next;
end;
$$;

-- ── 실행 권한(least-privilege) ──────────────────────────────────────────────
-- CREATE FUNCTION은 EXECUTE를 PUBLIC에 기본 부여하므로 회수 후 authenticated에만 grant한다
-- (anon 차단). 헬퍼는 SECURITY DEFINER 내부에서만 호출되므로 PUBLIC 회수만 한다.
revoke execute on function public.get_avatar_status() from public;
grant execute on function public.get_avatar_status() to authenticated;
revoke execute on function public._mood_decay_per_day() from public;
