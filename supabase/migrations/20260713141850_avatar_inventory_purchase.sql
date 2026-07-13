-- 아바타 코인 경제: 보유 인벤토리 + 구매 트랜잭션.
-- 이 프로젝트 DB는 현재 대시보드로 관리된다(마이그레이션 파일 0개, ERD 단계 생성). 이 파일은 리뷰·이력용으로
-- 두고 적용은 대시보드 SQL 에디터로 한다. supabase-convention은 CLI 마이그레이션을 권장하나 미확정 제안값이라,
-- 팀이 마이그레이션 체계를 도입하면 그때 baseline으로 편입한다.
-- 가격은 서버 권위값으로 이 함수 안에만 둔다. 클라이언트가 넘긴 cost는 신뢰하지 않는다.
-- 클라 상수(src/constants/avatar.ts: CHARACTER_COST=3000, THEME_COST=100)는 표시 전용이며
-- 여기 _item_cost()와 값이 일치해야 한다(드리프트 주의).

-- ── 보유 인벤토리 ───────────────────────────────────────────────────────────
-- 한 유저가 (종류, 값) 한 항목을 최대 1개 보유. 기본 보유(클래식/레서판다)는 행으로 두지 않고
-- 조회/구매 함수에서 암시적으로 처리한다(시드 트리거·백필 불필요).
create table if not exists public.avatar_inventory (
  user_id uuid not null references auth.users (id) on delete cascade,
  item_kind text not null check (item_kind in ('character', 'theme')),
  item_value text not null,
  acquired_at timestamptz not null default now(),
  primary key (user_id, item_kind, item_value)
);

alter table public.avatar_inventory enable row level security;

-- 본인 보유만 조회 가능. INSERT 정책은 두지 않는다 → 클라 직접 삽입 불가,
-- 오직 아래 SECURITY DEFINER 함수(buy_avatar_item)를 통해서만 지급된다(가격/중복 검증 강제).
drop policy if exists "avatar_inventory_select_own" on public.avatar_inventory;
create policy "avatar_inventory_select_own"
  on public.avatar_inventory
  for select
  using (auth.uid() = user_id);

-- ── 가격(서버 권위) ─────────────────────────────────────────────────────────
create or replace function public._avatar_item_cost(p_kind text)
returns integer
language sql
immutable
as $$
  select case p_kind
    when 'character' then 3000
    when 'theme' then 100
    else null
  end;
$$;

-- ── 종류별 허용 값(화이트리스트) ────────────────────────────────────────────
-- 위조된 임의 문자열 구매를 막는다. 클라 CHARACTER_TYPES/COLOR_THEME_VALUES와 정합.
create or replace function public._avatar_item_valid(p_kind text, p_value text)
returns boolean
language sql
immutable
as $$
  select case p_kind
    when 'character' then p_value = any (array['레서판다', '토끼', '강아지', '고양이'])
    when 'theme' then p_value = any (array['클래식', '라벤더', '민트', '피치', '스카이', '선샤인'])
    else false
  end;
$$;

-- 기본 보유(무료·항상 보유) 판정. 구매 시 "이미 보유"로 걸러진다.
create or replace function public._avatar_item_is_default(p_kind text, p_value text)
returns boolean
language sql
immutable
as $$
  select (p_kind = 'character' and p_value = '레서판다')
      or (p_kind = 'theme' and p_value = '클래식');
$$;

-- ── 보유 목록 조회 ──────────────────────────────────────────────────────────
-- 기본 보유 ∪ 구매분을 종류별로 반환. auth.uid()로 스코프.
create or replace function public.get_my_avatar_items()
returns table (item_kind text, item_value text)
language sql
security definer
set search_path = public
as $$
  select v.item_kind, v.item_value
  from (
    -- 기본 보유(항상 포함)
    values ('character', '레서판다'), ('theme', '클래식')
  ) as v (item_kind, item_value)
  where auth.uid() is not null
  union
  select i.item_kind, i.item_value
  from public.avatar_inventory i
  where i.user_id = auth.uid();
$$;

grant execute on function public.get_my_avatar_items() to authenticated;

-- ── 구매 트랜잭션 ───────────────────────────────────────────────────────────
-- 원자적: 보유 지급(INSERT)과 코인 차감(조건부 UPDATE)이 한 트랜잭션에서 커밋/롤백된다.
-- 실패 시 SQLSTATE로 사유를 구분해 서버 액션이 사용자 메시지로 매핑한다.
--   28000 미인증 / 22023 잘못된 항목 / PT409 이미 보유 / PT402 잔액 부족
create or replace function public.buy_avatar_item(p_kind text, p_value text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_cost integer;
  v_balance integer;
begin
  if v_user is null then
    raise exception '로그인이 필요합니다.' using errcode = '28000';
  end if;

  if not public._avatar_item_valid(p_kind, p_value) then
    raise exception '구매할 수 없는 항목입니다.' using errcode = '22023';
  end if;

  v_cost := public._avatar_item_cost(p_kind);

  -- 기본 보유 항목은 살 수 없다(이미 보유).
  if public._avatar_item_is_default(p_kind, p_value) then
    raise exception '이미 보유한 항목입니다.' using errcode = 'PT409';
  end if;

  -- 지급 먼저. 이미 보유(동시 중복 포함)면 PK 위반 → 결제 전에 차단.
  begin
    insert into public.avatar_inventory (user_id, item_kind, item_value)
    values (v_user, p_kind, p_value);
  exception
    when unique_violation then
      raise exception '이미 보유한 항목입니다.' using errcode = 'PT409';
  end;

  -- 조건부 차감: 잔액이 충분할 때만 갱신된다. 동시 구매 경합·음수 잔액을 한 문장으로 차단.
  update public.users
  set coin = coin - v_cost
  where id = v_user and coin >= v_cost
  returning coin into v_balance;

  -- 갱신된 행이 없으면 잔액 부족 → 예외로 INSERT까지 롤백.
  if v_balance is null then
    raise exception '코인이 부족합니다.' using errcode = 'PT402';
  end if;

  return v_balance;
end;
$$;

grant execute on function public.buy_avatar_item(text, text) to authenticated;
