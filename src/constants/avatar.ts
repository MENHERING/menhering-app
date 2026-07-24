import type { CharacterType, ColorTheme, ThemeRoles } from '@/types/avatar';
import type { Mood } from '@/types/mypage/model';

// 저장값은 한글(DB avatars.color_theme/character_type 정합). 영문 slug 사용 금지.

export const DEFAULT_CHARACTER_TYPE: CharacterType = '레서판다';
// 기본 테마 '기본'은 틴트 없음 → 캐릭터 원화색 그대로. 색 테마는 구매해서 입힌다.
export const DEFAULT_COLOR_THEME: ColorTheme = '기본';

// 닉네임 입력 제약(users.nickname). 실제 기본값은 소셜 로그인명으로 초기화됨.
export const NICKNAME_MAX_LENGTH = 20;

// 세션/닉네임이 없을 때 표시할 폴백 닉네임(로그인 전 미리보기용).
export const DEFAULT_NICKNAME = '멘헤링이';

// 감정 상태를 아직 못 읽었을 때(로딩 중·비로그인) 쓸 기본값. 심볼·기운 배경이 없는 중립 상태.
export const DEFAULT_MOOD: Mood = '보통';

// 감정 수치(mood_value 0~100) 기본값. avatar_status 행이 없거나(신규 유저) 조회 실패 시 폴백.
// DB avatar_status.mood_value의 기본값과 동일하게 60으로 맞춘다(60~79 보통 구간이라 moodFromValue(60)===DEFAULT_MOOD '보통').
export const DEFAULT_MOOD_VALUE = 60;

// Mood 5종의 런타임 목록(단일 출처). 타입 Mood는 유니온이라 런타임 값이 없어서,
// Zod z.enum 등 런타임 검증에 쓸 튜플을 여기서 파생시킨다.
export const MOODS = ['행복', '보통', '우울', '지침', '화남'] as const satisfies readonly Mood[];

export const CHARACTER_TYPES = [
  '레서판다',
  '토끼',
  '강아지',
  '고양이',
] as const satisfies readonly CharacterType[];

// 코인 경제(모델: 한 번 구매하면 보유, 재선택 무료). 미보유 선택분만 결제한다.
// ⚠️ 이 값은 표시 전용이다. 실제 결제 금액은 서버 RPC(buy_avatar_item)가 자체 보유한 값으로
// 차감하므로, DB 함수 _avatar_item_cost와 반드시 일치시켜야 한다
// (supabase/migrations/…_avatar_inventory_purchase.sql).
export const CHARACTER_COST = 3000;
export const THEME_COST = 100;

interface ColorThemeConfig {
  value: ColorTheme;
  // 캐릭터 색 슬롯 매핑. body는 픽커 스와치·Live2D 틴트에 함께 쓰인다.
  roles: ThemeRoles;
}

// 색상 테마. '기본'은 무료 기본값이며 body를 흰색으로 둬 Live2D 곱셈 틴트가 원화색을 그대로 살린다
// (흰색 × 텍스처 = 텍스처). 레드~그레이는 구매 대상. 레드는 기존 '클래식'(브랜드 코럴)을 개명한 것.
export const COLOR_THEMES: readonly ColorThemeConfig[] = [
  {
    value: '기본',
    roles: { body: '#FFFFFF', secondary: '#FFFFFF', accent: '#3D3D3D' },
  },
  {
    value: '레드',
    roles: { body: '#E8563A', secondary: '#F0D9CC', accent: '#3D3D3D' },
  },
  {
    value: '라벤더',
    roles: { body: '#B191E8', secondary: '#EFE7FB', accent: '#4A2A73' },
  },
  {
    value: '민트',
    roles: { body: '#7BD3A6', secondary: '#E4F7ED', accent: '#154A2E' },
  },
  {
    value: '피치',
    roles: { body: '#F79EC0', secondary: '#FDE7EE', accent: '#8E1327' },
  },
  {
    value: '스카이',
    roles: { body: '#8CCDEC', secondary: '#E6F4FC', accent: '#123F5E' },
  },
  {
    value: '선샤인',
    roles: { body: '#FFD400', secondary: '#FAF3E6', accent: '#6B4A22' },
  },
  {
    // 고양이 원화색(#9AA0A6)보다 진한 회색.
    value: '그레이',
    roles: { body: '#6B7280', secondary: '#DDE1E6', accent: '#3D3D3D' },
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

// 테마 값 → SVG 색 슬롯. 잘못된 값이 들어와도 기본(무색)으로 폴백.
export function getThemeRoles(theme: ColorTheme): ThemeRoles {
  return (COLOR_THEME_MAP[theme] ?? COLOR_THEME_MAP[DEFAULT_COLOR_THEME]).roles;
}
