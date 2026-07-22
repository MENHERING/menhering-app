-- 친구 추가 화면 지원 마이그레이션.
--
-- users.friend_code, friends 테이블은 이미 이 화면을 염두에 두고 설계돼 있었다(README 데이터 모델,
-- REST 스키마 조회로 실제 컬럼 존재 확인 완료: users.nickname/friend_code, friends.user_id/friend_id/
-- status/created_at/updated_at, avatars.character_type/color_theme, user_progress.xp/level/stage).
-- 컬럼 추가는 필요 없다 — bio(소개글)는 설정할 UI가 어디에도 없어 제외했다. 나온다면 그때 컬럼과
-- 설정 화면을 같이 추가한다.
--
-- Lv.N 표시는 별도 컬럼으로 저장하지 않고 user_progress.xp에서 매번 계산한다
-- (AvatarPreview.tsx의 "레벨/XP는 user_progress 도메인 연동 후 실제 값으로 교체" TODO를 계산식으로
-- 메꾼다). 레벨을 컬럼으로 저장하면 XP가 갱신될 때마다 같이 갱신해야 하고, 하나를 빠뜨리면 화면
-- 레벨이 실제 XP와 어긋나는 정합성 버그가 생긴다 — user_level_progress를 레벨별로 분리해야 했던
-- 이유와 같은 함정이라 계산식 하나로 통일해 원천 차단한다.
--
-- 모든 함수는 20260714171814_avatar_status_auth_error.sql이 정립한 규약을 따른다: 미인증 시
-- errcode 28000으로 raise하고, anon에도 EXECUTE를 명시적으로 부여한다. anon 롤이 함수 진입 자체를
-- 못 하면(42501 permission denied) route의 28000→401 매핑이 비껴가 privateFetch의 /login 리다이렉트가
-- 조용히 깨진다 — 함수 본체 첫 줄에서 바로 raise하므로 anon이 실제 데이터에 도달하는 일은 없다.

-- 1) 레벨 계산 함수. Lv 공식이 바뀔 여지가 있으므로 한 곳에만 모아둔다.
--    search/requests 두 RPC가 전부 이 함수 하나만 호출한다.
create or replace function public.calc_character_level(p_xp integer)
returns integer
language sql
immutable
as $$
  select greatest(1, floor(coalesce(p_xp, 0) / 100.0)::integer + 1);
$$;

-- 2) friends RLS 재정의.
--
--    적용 전 pg_policies 조회로 이 테이블에 이미 8개 정책(한글/영문 이름으로 중복된 select/insert/
--    update/delete 4종)이 마이그레이션 파일 없이 대시보드로 만들어져 있던 걸 확인했다. 그중
--    friends_update_target은 with_check 없이 qual만 (friend_id = auth.uid() OR user_id = auth.uid())
--    였는데, UPDATE에서 with_check 생략 시 Postgres가 qual을 그대로 재사용하므로 요청을 보낸
--    사람(user_id)도 스스로 status를 '수락'으로 바꿀 수 있었다(수신자 전용이어야 하는데 자기 요청을
--    자기가 수락 가능). insert 정책 2개도 status 값을 전혀 검사하지 않아 '대기중'을 건너뛰고 바로
--    '수락' 상태로 즉시 친구를 만들거나 자기 자신에게 요청하는 것도 막혀 있지 않았다.
--
--    이 프로젝트의 다른 모든 테이블(user_level_progress 등)은 RLS를 select만 열고 쓰기는 전부
--    RPC(security definer)로 강제하는 패턴이라, friends만 테이블 직접 쓰기가 열려 있으면 위 검증들이
--    (send_friend_request의 자기요청/중복요청 차단, respond_friend_request의 수신자 전용·원자적
--    상태 전이) supabase REST를 직접 호출하는 경로에서 통째로 우회된다. 기존 8개를 전부 지우고
--    select 1개만 남긴다 — insert/update/delete는 아래 RPC로만 가능하다.
alter table public.friends enable row level security;

drop policy if exists "friends: 본인 관련 조회" on public.friends;
drop policy if exists "friends: 본인 요청 삭제" on public.friends;
drop policy if exists "friends: 본인이 요청 생성" on public.friends;
drop policy if exists "friends: 수신자가 상태 변경" on public.friends;
drop policy if exists "friends_delete_own" on public.friends;
drop policy if exists "friends_insert_own" on public.friends;
drop policy if exists "friends_select_related" on public.friends;
drop policy if exists "friends_update_target" on public.friends;

drop policy if exists "본인 관련 친구 요청 조회" on public.friends;
create policy "본인 관련 친구 요청 조회"
  on public.friends for select
  to authenticated
  using (user_id = (select auth.uid()) or friend_id = (select auth.uid()));

-- 3) friends 유니크 인덱스 2개.
--    friends_user_id_friend_id_key: (user_id, friend_id) 정확히 같은 방향 중복만 막는다. 검색/조회
--    쿼리(search_friend_candidates 등)가 user_id=? and friend_id=? 형태로 필터링할 때 이 인덱스를
--    그대로 타므로 조회 성능을 위해 남겨둔다.
--    friends_pair_key: (A,B)/(B,A)는 방향만 다를 뿐 같은 두 사람 관계인데, 위 인덱스는 이걸 다른
--    키로 봐서 두 사람이 동시에 서로에게 요청을 보내면 반대 방향 '대기중' 행이 동시에 생기는 걸
--    못 막는다(둘 다 select 시점엔 서로를 못 보고 통과 — TOCTOU 경합). least/greatest로 방향을
--    지워 같은 쌍이면 항상 같은 키가 되게 한다. send_friend_request는 이 인덱스를 on conflict
--    대상으로 써서 "확인 후 삽입"이 아니라 삽입 자체의 원자성으로 경합을 막는다.
create unique index if not exists friends_user_id_friend_id_key
  on public.friends (user_id, friend_id);

create unique index if not exists friends_pair_key
  on public.friends (least(user_id, friend_id), greatest(user_id, friend_id));

-- ============================================================
-- 4) 내 친구 코드 조회
-- ============================================================
create or replace function public.get_my_friend_code()
returns varchar
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_code varchar;
begin
  if v_user_id is null then
    raise exception '로그인이 필요합니다.' using errcode = '28000';
  end if;

  select friend_code into v_code from users where id = v_user_id;

  return v_code;
end;
$$;

revoke execute on function public.get_my_friend_code() from public;
grant execute on function public.get_my_friend_code() to authenticated;
grant execute on function public.get_my_friend_code() to anon;

-- ============================================================
-- 5) 사용자 검색 — 닉네임 또는 친구 코드.
--    상대와의 관계 상태(NONE/PENDING_SENT/PENDING_RECEIVED/FRIEND)를 서버가 확정해 함께 내려준다.
--    클라이언트가 이 상태를 직접 계산하면 다른 요청의 성공/실패에 따라 화면 상태가 어긋날 수 있다.
--    최소 키워드 길이 검증은 여기서 하지 않는다 — Route Handler의 Zod 스키마가 단일 검증 지점이다.
-- ============================================================
create or replace function public.search_friend_candidates(p_keyword text)
returns table (
  user_id uuid,
  nickname varchar,
  friend_code varchar,
  character_type varchar,
  color_theme varchar,
  level integer,
  request_status varchar
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
    u.friend_code,
    a.character_type,
    a.color_theme,
    calc_character_level(coalesce(up.xp, 0)),
    (case
      when f_accepted.id is not null then 'FRIEND'
      when f_sent.id is not null then 'PENDING_SENT'
      when f_received.id is not null then 'PENDING_RECEIVED'
      else 'NONE'
    end)::varchar
  from users u
  left join avatars a on a.user_id = u.id
  left join user_progress up on up.user_id = u.id
  left join friends f_accepted
    on f_accepted.status = '수락'
    and ((f_accepted.user_id = v_user_id and f_accepted.friend_id = u.id)
      or (f_accepted.friend_id = v_user_id and f_accepted.user_id = u.id))
  left join friends f_sent
    on f_sent.status = '대기중'
    and f_sent.user_id = v_user_id and f_sent.friend_id = u.id
  left join friends f_received
    on f_received.status = '대기중'
    and f_received.user_id = u.id and f_received.friend_id = v_user_id
  where u.id <> v_user_id
    and (u.nickname ilike '%' || p_keyword || '%'
      or u.friend_code ilike p_keyword || '%')
  limit 20;
end;
$$;

revoke execute on function public.search_friend_candidates(text) from public;
grant execute on function public.search_friend_candidates(text) to authenticated;
grant execute on function public.search_friend_candidates(text) to anon;

-- ============================================================
-- 6) 친구 요청 생성.
--    자기 자신에게 요청은 여기서 막는다. 기존/충돌 판단은 별도 SELECT로 먼저 확인하지 않는다 —
--    "확인 후 삽입"은 그 사이에 다른 트랜잭션이 끼어들 수 있어(TOCTOU), 두 사람이 동시에 서로에게
--    요청을 보내면 양쪽 다 확인 시점엔 서로를 못 보고 통과해 반대 방향 '대기중' 행이 동시에
--    생길 수 있었다. 대신 INSERT를 바로 시도하고 그 성패를 friends_pair_key(방향 무관 유니크
--    인덱스)로 판단한다 — 유니크 인덱스 충돌 검사 자체가 DB 레벨에서 원자적이라 경합이 성립하지
--    않는다. 거절(거절) 이력이 있으면 재요청을 허용한다(대기중으로 되돌리고 이번 발신자 기준으로
--    방향도 새로 맞춘다) — 재요청 정책은 추후 바뀔 수 있다.
--    22023(잘못된 입력)/PT409(충돌)는 avatar_inventory_purchase.sql이 세운 커스텀 SQLSTATE 규약을
--    그대로 따른다.
-- ============================================================
create or replace function public.send_friend_request(p_target_user_id uuid)
returns public.friends
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_row public.friends;
begin
  if v_user_id is null then
    raise exception '로그인이 필요합니다.' using errcode = '28000';
  end if;
  if v_user_id = p_target_user_id then
    raise exception '자신에게는 친구 요청을 보낼 수 없습니다.' using errcode = '22023';
  end if;

  insert into friends (user_id, friend_id, status)
  values (v_user_id, p_target_user_id, '대기중')
  on conflict (least(user_id, friend_id), greatest(user_id, friend_id))
  do update set
    user_id = excluded.user_id,
    friend_id = excluded.friend_id,
    status = '대기중',
    updated_at = now()
  where friends.status = '거절'
  returning * into v_row;

  -- 충돌한 기존 행이 '거절'이 아니면(이미 '대기중'이거나 '수락') where절이 막아 갱신도 반환도
  -- 안 되므로 found가 false다 — 이 경우만 충돌로 본다.
  if not found then
    raise exception '이미 친구이거나 대기 중인 요청이 있습니다.' using errcode = 'PT409';
  end if;

  return v_row;
end;
$$;

revoke execute on function public.send_friend_request(uuid) from public;
grant execute on function public.send_friend_request(uuid) to authenticated;
grant execute on function public.send_friend_request(uuid) to anon;

-- ============================================================
-- 7) 요청 수락/거절.
--    fix_level_progress_race.sql과 동일한 원자적 패턴: SELECT 후 별도 UPDATE가 아니라 WHERE 절에
--    조건(status='대기중')을 직접 걸어 동시 요청으로 인한 이중 처리를 구조적으로 막는다.
--    PT404는 이 프로젝트에 없던 코드라 새로 쓴다 — "이미 처리됐거나 존재하지 않는 요청"을 가리킨다.
-- ============================================================
create or replace function public.respond_friend_request(
  p_request_id uuid,
  p_action varchar
)
returns public.friends
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_status varchar;
  v_row public.friends;
begin
  if v_user_id is null then
    raise exception '로그인이 필요합니다.' using errcode = '28000';
  end if;
  if p_action not in ('accept', 'reject') then
    raise exception '올바르지 않은 action입니다: %', p_action using errcode = '22023';
  end if;

  v_status := case p_action when 'accept' then '수락' else '거절' end;

  update friends
    set status = v_status, updated_at = now()
  where id = p_request_id
    and friend_id = v_user_id   -- 받은 사람 본인만 응답 가능
    and status = '대기중'        -- 이미 처리된 요청 재처리 방지 (원자적 조건)
  returning * into v_row;

  if not found then
    raise exception '처리할 수 없는 요청입니다.' using errcode = 'PT404';
  end if;

  return v_row;
end;
$$;

revoke execute on function public.respond_friend_request(uuid, varchar) from public;
grant execute on function public.respond_friend_request(uuid, varchar) to authenticated;
grant execute on function public.respond_friend_request(uuid, varchar) to anon;

-- ============================================================
-- 8) 받은 친구 요청 목록 (배지 카운트 + 카드 리스트에 그대로 사용)
-- ============================================================
create or replace function public.get_pending_friend_requests()
returns table (
  request_id uuid,
  sender_id uuid,
  nickname varchar,
  character_type varchar,
  color_theme varchar,
  level integer,
  created_at timestamptz
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
    f.id,
    u.id,
    u.nickname,
    a.character_type,
    a.color_theme,
    calc_character_level(coalesce(up.xp, 0)),
    f.created_at
  from friends f
  join users u on u.id = f.user_id
  left join avatars a on a.user_id = u.id
  left join user_progress up on up.user_id = u.id
  where f.friend_id = v_user_id
    and f.status = '대기중'
  order by f.created_at desc;
end;
$$;

revoke execute on function public.get_pending_friend_requests() from public;
grant execute on function public.get_pending_friend_requests() to authenticated;
grant execute on function public.get_pending_friend_requests() to anon;

-- ============================================================
-- 9) friend_code 자동 생성 + 기존 유저 백필.
--
--    지금까지 이 컬럼을 채우는 주체가 아무데도 없어 전부 null이었다. avatar_status_autocreate.sql과
--    동일한 이유로 트리거를 쓴다: "모든 유저는 friend_code를 정확히 하나 갖는다"는 불변식을
--    생성 경로(가입 트리거가 public.users에 insert하든, 다른 경로로 insert하든)와 무관하게 보장한다.
--
--    형식은 4자-4자(예: 7F3K-Q9XZ). 헷갈리는 0/O, 1/I/L은 알파벳에서 빼서 사람이 직접 불러주거나
--    타이핑해도 헷갈리지 않게 했다. 유니크 검사는 신규 가입(트리거, 매번 새 트랜잭션이라 이전
--    커밋을 정확히 봄) 기준으로 짰다 — 아래 백필 UPDATE는 한 문장 안에서 여러 행을 동시에 채우므로
--    직전 행에서 막 배정한 코드가 같은 문장 스냅샷에는 안 보일 수 있지만(READ COMMITTED, 문장 단위
--    스냅샷), 4자×4자 코드 공간(약 33^8 ≈ 3.9조 경우의 수) 대비 백필 대상 유저 수가 무시할 만큼
--    작아 실질적 충돌 위험은 없다. 혹시라도 겹치면 바로 아래 유니크 인덱스가 막아 마이그레이션이
--    조용히 성공하는 대신 에러로 드러난다.
create or replace function public.generate_friend_code()
returns varchar
language plpgsql
as $$
declare
  v_chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_code varchar;
begin
  loop
    v_code :=
      (select string_agg(substr(v_chars, (random() * length(v_chars))::int + 1, 1), '')
       from generate_series(1, 4))
      || '-' ||
      (select string_agg(substr(v_chars, (random() * length(v_chars))::int + 1, 1), '')
       from generate_series(1, 4));

    exit when not exists (select 1 from public.users where friend_code = v_code);
  end loop;

  return v_code;
end;
$$;

create or replace function public.set_friend_code()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.friend_code is null then
    new.friend_code := public.generate_friend_code();
  end if;

  return new;
end;
$$;

drop trigger if exists trg_users_set_friend_code on public.users;
create trigger trg_users_set_friend_code
before insert on public.users
for each row
execute function public.set_friend_code();

-- 기존 유저 백필 (없는 것만 채운다, 멱등)
update public.users
set friend_code = public.generate_friend_code()
where friend_code is null;

-- 코드 중복 배정을 DB 레벨에서 최종적으로 막는다(on conflict 대상은 아니라 send_friend_request의
-- 유니크 인덱스와 달리 단순 유니크 제약 목적).
create unique index if not exists users_friend_code_key
  on public.users (friend_code);

-- 트리거 전용 함수라 직접 실행 권한은 회수한다(avatar_status_autocreate.sql의 create_avatar_status와
-- 동일 규약). generate_friend_code()는 set_friend_code()가 SECURITY DEFINER로 내부 호출하므로
-- 별도 grant 없이도 트리거 경로에서 동작한다.
revoke execute on function public.set_friend_code() from public;
