import type { ThemeRoles } from '@/types/avatar';

// 모든 캐릭터 SVG가 공유하는 색 슬롯 + 표시 옵션.
// 색은 SVG fill 속성(attribute)으로 주입하므로 인라인 style 규칙과 무관하다.
export interface CharacterSvgProps extends ThemeRoles {
  className?: string;
  title?: string;
}
