import type { CharacterType, ColorTheme, ThemeRoles } from '@/types/avatar';

// 저장값은 한글(DB avatars.color_theme/character_type 정합). 영문 slug 사용 금지.

export const DEFAULT_CHARACTER_TYPE: CharacterType = '레서판다';
export const DEFAULT_COLOR_THEME: ColorTheme = '클래식';

// 닉네임 입력 제약(users.nickname). 실제 기본값은 소셜 로그인명으로 초기화됨.
export const NICKNAME_MAX_LENGTH = 20;

// 세션/닉네임이 없을 때 표시할 폴백 닉네임(로그인 전 미리보기용).
export const DEFAULT_NICKNAME = '멘헤링이';

export const CHARACTER_TYPES = [
  '레서판다',
  '토끼',
  '강아지',
  '고양이',
] as const satisfies readonly CharacterType[];

// 코인 경제(모델: 한 번 구매하면 보유, 재선택 무료). 미보유 선택분만 결제한다.
export const CHARACTER_COST = 1000;
export const THEME_COST = 100;

// 보유 목록 placeholder — 보유 데이터 모델(DB) 확정 전 UI 데모용. 기본 지급분만 보유.
// TODO: 보유 테이블/컬럼 연동 시 서버 조회값으로 교체.
export const OWNED_CHARACTERS: readonly CharacterType[] = [DEFAULT_CHARACTER_TYPE];
export const OWNED_THEMES: readonly ColorTheme[] = [DEFAULT_COLOR_THEME];

// 헤더 코인 잔액 placeholder. TODO: users.coin 실조회로 교체(auth 연동 후).
export const PLACEHOLDER_COIN = 1000;

interface ColorThemeConfig {
  value: ColorTheme;
  // 프리셋 스와치 미리보기(밝은 → 어두운). roles와 별개로 UI 표시용.
  swatches: readonly [string, string, string];
  // 캐릭터 SVG 색 슬롯 매핑
  roles: ThemeRoles;
}

// 와이어프레임 색상 테마 6종. 클래식은 브랜드 토큰 재사용.
export const COLOR_THEMES: readonly ColorThemeConfig[] = [
  {
    value: '클래식',
    swatches: ['#E8563A', '#F0D9CC', '#3D3D3D'],
    roles: { body: '#E8563A', secondary: '#F0D9CC', accent: '#3D3D3D' },
  },
  {
    value: '라벤더',
    swatches: ['#C9B8F0', '#B191E8', '#7A3FB0'],
    roles: { body: '#B191E8', secondary: '#EFE7FB', accent: '#4A2A73' },
  },
  {
    value: '민트',
    swatches: ['#A7E8C6', '#7BD3A6', '#1E5B3A'],
    roles: { body: '#7BD3A6', secondary: '#E4F7ED', accent: '#154A2E' },
  },
  {
    value: '피치',
    swatches: ['#F9C6D3', '#F79EC0', '#C81E3A'],
    roles: { body: '#F79EC0', secondary: '#FDE7EE', accent: '#8E1327' },
  },
  {
    value: '스카이',
    swatches: ['#BFE1F3', '#8CCDEC', '#12405F'],
    roles: { body: '#8CCDEC', secondary: '#E6F4FC', accent: '#123F5E' },
  },
  {
    value: '선샤인',
    swatches: ['#E8C15C', '#F1DFA0', '#7A5A1E'],
    roles: { body: '#E8C15C', secondary: '#FBF1CF', accent: '#6E5017' },
  },
];

// 색상 테마 값만 추출한 목록. 검증(zod) 등에서 재사용하는 단일 출처.
export const COLOR_THEME_VALUES = COLOR_THEMES.map((theme) => theme.value) as [
  ColorTheme,
  ...ColorTheme[],
];

const COLOR_THEME_MAP: Record<ColorTheme, ColorThemeConfig> = COLOR_THEMES.reduce(
  (acc, theme) => {
    acc[theme.value] = theme;
    return acc;
  },
  {} as Record<ColorTheme, ColorThemeConfig>,
);

// 테마 값 → SVG 색 슬롯. 잘못된 값이 들어와도 클래식으로 폴백.
export function getThemeRoles(theme: ColorTheme): ThemeRoles {
  return (COLOR_THEME_MAP[theme] ?? COLOR_THEME_MAP[DEFAULT_COLOR_THEME]).roles;
}
