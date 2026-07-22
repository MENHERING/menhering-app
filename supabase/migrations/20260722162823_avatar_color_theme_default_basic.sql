-- avatars.color_theme 컬럼 DEFAULT를 '클래식' → '기본'으로 바꾼다.
-- 테마 개편(20260722144613/155217)에서 chk_color_theme가 '클래식'을 더는 허용하지 않는데
-- 컬럼 DEFAULT는 여전히 '클래식'이라, color_theme를 명시하지 않는 insert가 있으면 23514(제약 위반)로
-- 깨진다. 현재 저장 경로(save_avatar)는 항상 값을 넘기지만, 기본값을 유효값으로 맞춰 지뢰를 없앤다.
-- 재실행 안전(멱등): set default는 값이 같아도 무해.
alter table public.avatars alter column color_theme set default '기본';
