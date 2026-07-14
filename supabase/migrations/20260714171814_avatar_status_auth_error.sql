-- get_avatar_status(): 미인증 시 빈 결과 대신 raise(errcode 28000)로 바꾼다.
--
-- 이 파일도 멱등이다(create or replace). CLI(supabase db push)로 적용해도, 이미 적용된 환경에
-- 다시 돌려도 안전하다.
--
-- 왜:
--   기존 구현은 "미인증(auth.uid() is null)"과 "상태행 없음(신규 유저)"을 똑같이 빈 결과로 반환했다.
--   route는 둘을 구분할 신호가 없어 양쪽 모두 DEFAULT_MOOD_VALUE(60) 폴백 + HTTP 200으로 내려줬고,
--   그 결과 비로그인 요청이 401이 아니라 200 + 가짜 '보통'을 받았다. 이 엔드포인트는 privateFetch로
--   호출되고 privateFetch는 401을 받아야 /login으로 보내므로 계약이 어긋나 있었다(지금은 proxy.ts가
--   앞단에서 막아주는 덕에 가려져 있을 뿐, PUBLIC 규칙이 바뀌거나 API를 직접 호출하면 드러난다).
--
--   save_avatar()/buy_avatar_item()은 이미 미인증 시 errcode 28000을 raise하고 서버 액션이 그것을
--   코드로 매핑한다. 같은 규약으로 통일해 route가 28000 → ApiError(401)로 매핑한다.
--
--   "상태행 없음"은 계속 빈 결과로 남긴다 — 아바타를 아직 저장하지 않은 로그인 유저는 정상 상황이고,
--   route가 기본값(60/'보통')으로 폴백하는 게 맞다.
--
-- 감쇠(lazy settle) 로직은 20260714121731_avatar_mood_decay.sql와 동일하며, 미인증 분기만 바뀐다.

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
  -- 미인증: 28000(invalid_authorization_specification) → route가 401로 매핑 → privateFetch가 /login 유도.
  if v_user is null then
    raise exception '로그인이 필요합니다.' using errcode = '28000';
  end if;

  -- for update of s: 감쇠는 읽고→계산→되쓰는 read-modify-write라, 읽은 직후 다른 트랜잭션이
  -- mood_value를 올리면(향후 먹이주기·문제풀이 보상) stale 값 기반 감쇠가 그 상승을 덮어쓸 수 있다
  -- (lost update). 상태행을 잠가 동시 쓰기와 직렬화한다. avatar_status만 잠그면 충분(avatars는 안 씀).
  select s.mood_value, s.updated_at
    into v_mood, v_updated
  from public.avatar_status s
  join public.avatars a on a.id = s.avatar_id
  where a.user_id = v_user
  for update of s
  limit 1;

  if not found then
    return; -- 상태행 없음(아바타 미저장): 빈 결과 → route가 기본값 폴백(정상 상황)
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

-- ── 실행 권한 ───────────────────────────────────────────────────────────────
-- ⚠️ anon에게 EXECUTE를 명시적으로 부여한다. 직관과 반대라 반드시 읽을 것.
--
--    비로그인 요청은 supabase 서버 클라이언트가 anon 키로 나가므로 anon 롤로 실행된다. anon이 이 함수에
--    진입할 수 있어야 위의 raise(28000)를 맞고, route가 그걸 401로 매핑해 privateFetch가 /login으로
--    보낸다. anon에 EXECUTE가 없으면 미인증 호출은 28000이 아니라 42501(permission denied)을 받고,
--    route의 28000 분기를 비껴가 500으로 떨어진다 — 401 리다이렉트가 조용히 깨진다.
--
--    데이터는 새지 않는다: 함수 본체 첫 줄이 auth.uid() is null 검사이고 거기서 바로 raise하므로,
--    anon은 어떤 테이블에도 도달하지 못한다. "anon이 실행 가능"과 "anon이 데이터를 본다"는 다르다.
--
--    왜 명시적으로 grant하는가: 지금 dev에서 이 경로가 동작하는 건 Supabase가 기본으로 걸어둔
--    ALTER DEFAULT PRIVILEGES(... GRANT EXECUTE ON FUNCTIONS TO anon, authenticated) 덕분이다.
--    anon은 PUBLIC이 아니라 직접 grant로 EXECUTE를 받으므로 아래 revoke from public이 그걸 회수하지
--    못한다(실측: anon 키 호출 → HTTP 403 + code 28000). 하지만 그건 우리 SQL 어디에도 적히지 않은
--    암묵적·환경의존적 권한이라, 기본 권한 설정이 다른 환경에 db push하면 401 경로가 말없이 깨진다.
--    의존을 눈에 보이게 만들어 못 박는다.
revoke execute on function public.get_avatar_status() from public;
grant execute on function public.get_avatar_status() to authenticated;
grant execute on function public.get_avatar_status() to anon;
