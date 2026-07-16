-- 아바타 감정 상태 행(avatar_status) 자동 생성 + 기존 아바타 백필.
--
-- 이 파일 전체가 멱등이다(create or replace / drop if exists / on conflict do nothing / 없는 것만 백필).
-- 따라서 CLI(supabase db push)로 적용해도, 이미 적용된 환경에 다시 돌려도 안전하다.
-- ⚠️ dev DB에는 이 파일 작성 시점에 대시보드 SQL 에디터로 선적용했다(기존 마이그레이션 3개와 동일 관행).
--    supabase-convention은 "CLI 마이그레이션으로 관리, 대시보드 수동 변경 지양"을 규정하므로 관행과
--    어긋나 있다 — 기존 파일 3개까지 포함한 정리는 별도 이슈로 다룬다.
--
-- 왜 필요한가:
--   avatar_status는 avatars와 1:1(avatar_id UNIQUE)인데, 지금까지 이 행을 만드는 주체가 아무데도 없었다.
--   save_avatar()는 avatars·users.nickname만 쓰고, get_avatar_status()는 select/update만 한다.
--   그 결과 avatars가 있어도 avatar_status가 없어 get_avatar_status()가 항상 not found → 빈 결과 →
--   route가 DEFAULT_MOOD_VALUE(60) 폴백 → 감정이 항상 '보통'으로 고정되고, #42 감쇠도 깎을 행이 없어
--   한 번도 동작하지 못했다.
--
-- 왜 트리거인가:
--   "모든 아바타는 감정 상태 행을 정확히 하나 갖는다"는 불변식을 생성 경로와 무관하게 보장한다.
--   save_avatar()에 insert를 끼워 넣으면 그 경로에만 걸려, 향후 다른 경로로 아바타가 생기면 구멍이
--   다시 열린다. avatars INSERT에 한 번 걸어두면 경로가 늘어도 불변식이 유지된다.
--
-- mood_value/updated_at은 컬럼 기본값(60 / now())에 맡기고 avatar_id만 넣는다 — 기본값의 단일 출처를
-- 테이블 정의로 유지한다(앱의 DEFAULT_MOOD_VALUE=60과 정합).

-- ── 아바타 생성 시 감정 상태 행 생성 ────────────────────────────────────────
-- SECURITY DEFINER: 트리거는 아바타를 INSERT한 역할로 실행되는데, 그 역할에 avatar_status INSERT
-- 정책이 없으면 RLS에 막힌다. owner 권한으로 써서 호출 경로(RPC/직접 insert)에 관계없이 성공시킨다
-- (get_avatar_status가 감쇠 write를 SECURITY DEFINER로 하는 것과 동일 패턴).
create or replace function public.create_avatar_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- on conflict: 동시 삽입·재실행에도 1:1(avatar_id UNIQUE)을 깨지 않고 조용히 넘어간다(멱등).
  insert into public.avatar_status (avatar_id)
  values (new.id)
  on conflict (avatar_id) do nothing;

  return new;
end;
$$;

drop trigger if exists trg_avatars_create_status on public.avatars;

create trigger trg_avatars_create_status
after insert on public.avatars
for each row
execute function public.create_avatar_status();

-- ── 기존 아바타 백필 ────────────────────────────────────────────────────────
-- 트리거 이전에 만들어진 아바타에는 상태 행이 없다. 없는 것만 채운다(멱등, 재실행 안전).
insert into public.avatar_status (avatar_id)
select a.id
from public.avatars a
left join public.avatar_status s on s.avatar_id = a.id
where s.id is null;

-- ── 실행 권한(least-privilege) ──────────────────────────────────────────────
-- 트리거 함수는 트리거를 통해서만 호출되므로 직접 실행 권한은 회수한다.
revoke execute on function public.create_avatar_status() from public;
