-- #119: 친구 랭킹(전체 기간) 실 데이터 연동.
-- 본인 + 상태가 '수락'인 친구 전체를 XP 내림차순으로 반환한다. 조인 패턴은
-- search_friend_candidates(20260721120000_friend_add_screen.sql)의 accepted 판정과 동일하다.
-- 주간 랭킹은 이번 스코프에서 제외한다(#119) — XP를 기간별로 집계할 데이터가 스키마에 없다.
-- returns table 컬럼 타입이 바뀌면(streak integer→smallint) create or replace로는 안 되고
-- drop 후 재생성해야 한다(42P13). 이 함수는 아직 이 마이그레이션 안에서만 존재하므로 안전하다.
drop function if exists public.get_friend_ranking();

create or replace function public.get_friend_ranking()
returns table (
  user_id uuid,
  nickname varchar,
  character_type varchar,
  color_theme varchar,
  xp integer,
  days_since_active integer,
  streak smallint,
  is_me boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception '로그인이 필요합니다.' using errcode = '28000';
  end if;

  return query
  select
    u.id,
    u.nickname,
    a.character_type,
    a.color_theme,
    coalesce(up.xp, 0),
    (current_date - up.last_attended)::integer,
    up.streak,
    (u.id = v_user_id)
  from users u
  left join avatars a on a.user_id = u.id
  left join user_progress up on up.user_id = u.id
  where u.id = v_user_id
    or exists (
      select 1 from friends f
      where f.status = '수락'
        and ((f.user_id = v_user_id and f.friend_id = u.id)
          or (f.friend_id = v_user_id and f.user_id = u.id))
    )
  order by coalesce(up.xp, 0) desc, u.id;
end;
$$;

-- anon에도 EXECUTE를 명시 부여한다 — anon이 진입 자체를 막히면(42501) route의 28000→401 매핑이
-- 비껴가 privateFetch의 /login 리다이렉트가 조용히 깨진다(friend_add_screen.sql과 동일 규약).
revoke execute on function public.get_friend_ranking() from public;
grant execute on function public.get_friend_ranking() to authenticated;
grant execute on function public.get_friend_ranking() to anon;
