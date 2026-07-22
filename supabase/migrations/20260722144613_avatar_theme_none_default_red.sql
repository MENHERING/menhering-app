-- 색상 테마 개편: 기본을 '무색'(틴트 없음, 원화색)으로, 기존 '클래식'(브랜드 코럴=빨강)을 '레드'로 개명.
-- - 무색: 무료·항상 보유(기본). 구매 대상 아님 → 화이트리스트에 넣지 않는다.
-- - 레드: 구매 대상(개명 전 클래식과 동일 색). 기존 클래식 사용자는 레드로 이관 + 무료 보유 부여(grandfather).
-- 클라 정합: src/types/avatar.ts ColorTheme, src/constants/avatar.ts COLOR_THEMES/DEFAULT_COLOR_THEME.
-- 재실행 안전(idempotent): drop if exists / create or replace / on conflict do nothing.

-- ── 0) avatars.color_theme CHECK 제약 제거 ──────────────────────────────────
-- 기존 chk_color_theme는 옛 6종(클래식/…)만 허용해 레드로 못 바꾼다. 이관 후 새 값으로 재생성한다.
alter table public.avatars drop constraint if exists chk_color_theme;

-- ── 1) 구매 화이트리스트: 클래식 → 레드 (무색은 구매 대상 아님) ──────────────
create or replace function public._avatar_item_valid(p_kind text, p_value text)
returns boolean
language sql
immutable
as $$
  select case p_kind
    when 'character' then p_value = any (array['레서판다', '토끼', '강아지', '고양이'])
    when 'theme' then p_value = any (array['레드', '라벤더', '민트', '피치', '스카이', '선샤인', '회색'])
    else false
  end;
$$;

-- ── 2) 기본 보유(무료·항상 보유) 테마: 클래식 → 무색 ──────────────────────────
create or replace function public._avatar_item_is_default(p_kind text, p_value text)
returns boolean
language sql
immutable
as $$
  select (p_kind = 'character' and p_value = '레서판다')
      or (p_kind = 'theme' and p_value = '무색');
$$;

-- ── 3) 보유 목록 조회의 기본 보유: 클래식 → 무색 ─────────────────────────────
create or replace function public.get_my_avatar_items()
returns table (item_kind text, item_value text)
language sql
security definer
set search_path = public
as $$
  select v.item_kind, v.item_value
  from (
    -- 기본 보유(항상 포함)
    values ('character', '레서판다'), ('theme', '무색')
  ) as v (item_kind, item_value)
  where auth.uid() is not null
  union
  select i.item_kind, i.item_value
  from public.avatar_inventory i
  where i.user_id = auth.uid();
$$;

-- ── 4) 데이터 이관 ───────────────────────────────────────────────────────────
-- (a) 기존 클래식 사용자에게 '레드' 무료 보유 부여 — 무료로 쓰던 빨강을 유지(이제 레드는 구매 대상).
--     반드시 개명(update) 전에 실행한다(color_theme='클래식' 조건으로 대상 선별).
insert into public.avatar_inventory (user_id, item_kind, item_value)
select a.user_id, 'theme', '레드'
from public.avatars a
where a.color_theme = '클래식'
on conflict do nothing;

-- (b) 클래식 → 레드 개명 이관.
update public.avatars set color_theme = '레드' where color_theme = '클래식';

-- ── 5) CHECK 제약 재생성: 무색·레드 포함, 클래식 제외(이관 후 클래식 행 없음) ──
-- 클라 COLOR_THEME_VALUES와 정합. 위조/드리프트 방지용 whitelist.
alter table public.avatars
  add constraint chk_color_theme
  check (color_theme in ('무색', '레드', '라벤더', '민트', '피치', '스카이', '선샤인', '회색'));
