-- 테마 저장값 통일: '무색' → '기본', '회색' → '그레이' (표시명과 저장값 일치).
-- 앞선 20260722144613에서 무색/회색으로 세팅한 걸, 클라 ColorTheme(기본/그레이)와 맞춘다.
-- 재실행 안전(idempotent): drop if exists / create or replace / update는 대상 없으면 no-op.

-- 0) CHECK 제약 제거 (이관 중 새 값 허용)
alter table public.avatars drop constraint if exists chk_color_theme;

-- 1) 구매 화이트리스트: 회색 → 그레이 (기본은 무료라 미포함)
create or replace function public._avatar_item_valid(p_kind text, p_value text)
returns boolean language sql immutable as $$
  select case p_kind
    when 'character' then p_value = any (array['레서판다', '토끼', '강아지', '고양이'])
    when 'theme' then p_value = any (array['레드', '라벤더', '민트', '피치', '스카이', '선샤인', '그레이'])
    else false
  end;
$$;

-- 2) 기본 보유 테마: 무색 → 기본
create or replace function public._avatar_item_is_default(p_kind text, p_value text)
returns boolean language sql immutable as $$
  select (p_kind = 'character' and p_value = '레서판다')
      or (p_kind = 'theme' and p_value = '기본');
$$;

-- 3) 보유 목록 조회 기본 보유: 무색 → 기본
create or replace function public.get_my_avatar_items()
returns table (item_kind text, item_value text)
language sql security definer set search_path = public as $$
  select v.item_kind, v.item_value
  from (values ('character', '레서판다'), ('theme', '기본')) as v (item_kind, item_value)
  where auth.uid() is not null
  union
  select i.item_kind, i.item_value from public.avatar_inventory i where i.user_id = auth.uid();
$$;

-- 4) 데이터 이관 (avatars.color_theme + 구매 보유 avatar_inventory 둘 다)
update public.avatars set color_theme = '기본' where color_theme = '무색';
update public.avatars set color_theme = '그레이' where color_theme = '회색';
update public.avatar_inventory set item_value = '그레이'
  where item_kind = 'theme' and item_value = '회색';
-- '무색'은 무료라 인벤토리 행이 없지만(기본 보유), 혹시 있으면 정리.
update public.avatar_inventory set item_value = '기본'
  where item_kind = 'theme' and item_value = '무색';

-- 5) CHECK 제약 재생성 (기본·그레이로)
alter table public.avatars add constraint chk_color_theme
  check (color_theme in ('기본', '레드', '라벤더', '민트', '피치', '스카이', '선샤인', '그레이'));
