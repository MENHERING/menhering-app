-- security definer 함수들의 anon EXECUTE 회수.
--
-- 배경: Supabase는 ALTER DEFAULT PRIVILEGES로 새 함수마다 anon/authenticated/service_role에게
-- EXECUTE를 "명시적으로" 부여한다. 기존 마이그레이션들이 쓴 `revoke ... from public`은 PUBLIC
-- 유사 롤만 건드리므로 명시적 anon grant가 그대로 남아 있었다. 아래 함수들은 security definer로
-- 돌아 RLS를 우회하므로, 비로그인 롤에서 호출 가능한 상태를 남겨둘 이유가 없다.
--
-- 안전성 확인(2026-07-20):
--   - 대상 함수의 앱 호출부는 전부 로그인이 필요한 경로다. proxy.ts의 공개 경로는
--     '/', '/login', '/auth*', '/api/health'뿐이고 여기 해당하는 호출부가 없다.
--     따라서 실제 호출 롤은 항상 authenticated이며 anon 회수가 동작에 영향을 주지 않는다.
--   - handle_new_user / create_avatar_status는 앱에서 직접 호출하는 곳이 없다(트리거·내부 호출
--     전용). 내부 호출은 감싸는 security definer 함수의 소유자 권한으로 실행되므로 외부 EXECUTE가
--     필요 없고, 트리거 실행은 호출 롤의 EXECUTE 권한을 다시 검사하지 않는다(권한 검사는
--     CREATE TRIGGER 시점에 끝난다). 게다가 auth.users INSERT를 수행하는 주체는 anon이 아니라
--     Supabase 인증 서비스 롤이다.
--
-- 시그니처를 하드코딩하지 않고 pg_proc에서 찾아 회수한다. 인자 타입을 손으로 적으면 하나만
-- 어긋나도 실패하고, 오버로드가 있으면 일부만 걸린다.

do $$
declare
  fn record;
begin
  -- 로그인 상태에서만 호출되는 함수: anon만 회수(authenticated는 유지해야 앱이 돈다).
  for fn in
    select p.oid::regprocedure as sig
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in (
        'buy_avatar_item',
        'get_my_avatar_items',
        'get_avatar_status',
        'apply_wrong_note_review_reward'
      )
  loop
    execute format('revoke execute on function %s from anon', fn.sig);
    raise notice 'revoked anon: %', fn.sig;
  end loop;

  -- 앱에서 직접 호출하지 않는 내부 전용 함수: 외부 롤 전부 회수.
  for fn in
    select p.oid::regprocedure as sig
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in ('handle_new_user', 'create_avatar_status')
  loop
    execute format('revoke execute on function %s from public, anon, authenticated', fn.sig);
    raise notice 'revoked public/anon/authenticated: %', fn.sig;
  end loop;
end $$;
