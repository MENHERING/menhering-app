-- get_my_avatar()에 xp를 추가한다. 아바타 페이지가 레벨 뱃지를 그리려고 user_progress를 별도로
-- 한 번 더 조회하던 것을 없애, 페이지 초기 조회를 3회 → 2회로 줄이고 "레벨만 따로 실패"하는
-- 케이스 자체를 없앤다(아바타·코인과 생사를 같이한다).
--
-- ⚠️ create or replace를 쓸 수 없다: RETURNS TABLE에 컬럼을 추가하는 것은 반환 타입 변경이라
--    Postgres가 "cannot change return type of existing function"으로 거부한다. drop 후 재생성한다.
-- ⚠️ drop하면 함수 ACL도 함께 사라져 기본 권한으로 돌아가므로 재생성 직후 다시 건다.
--    (create or replace였다면 기존 ACL이 유지돼 이 단계가 필요 없다.)
--    이때 `revoke ... from public` 하나로는 부족하다: Supabase는 ALTER DEFAULT PRIVILEGES로
--    anon/authenticated/service_role 각각에게 EXECUTE를 "명시적으로" 부여하는데, 명시적 grant는
--    PUBLIC revoke로 지워지지 않는다. anon을 따로 회수해야 실제로 비로그인 호출이 막힌다.
-- 전체를 한 트랜잭션으로 묶어, drop된 채로 앱 요청이 들어오는 순간이 없게 한다.
--
-- xp는 left join이라 진행도 행이 없는 신규 유저에게는 null로 온다. inner join으로 바꾸면
-- 진행도가 없는 유저에게 아바타·닉네임·코인까지 통째로 안 나가므로 절대 바꾸지 않는다.
-- null 처리(→ 0 XP → Lv.1)는 호출부(getMyAvatar)가 담당한다.

begin;

drop function if exists public.get_my_avatar();

create function public.get_my_avatar()
returns table(
  id uuid,
  user_id uuid,
  character_type text,
  color_theme text,
  created_at timestamptz,
  updated_at timestamptz,
  nickname text,
  coin integer,
  xp integer
)
language sql
set search_path to ''
as $function$
  select a.id, u.id as user_id, a.character_type::text, a.color_theme::text,
         a.created_at, a.updated_at, u.nickname::text, u.coin::integer,
         p.xp::integer
  from public.users u
  left join public.avatars a on a.user_id = u.id
  left join public.user_progress p on p.user_id = u.id
  where u.id = (select auth.uid());
$function$;

-- drop으로 초기화된 권한 복구: PUBLIC과 anon을 각각 회수한 뒤 로그인 롤에만 부여.
revoke execute on function public.get_my_avatar() from public;
revoke execute on function public.get_my_avatar() from anon;
grant execute on function public.get_my_avatar() to authenticated;

commit;
