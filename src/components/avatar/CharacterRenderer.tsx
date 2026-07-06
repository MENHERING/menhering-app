import { DEFAULT_CHARACTER_TYPE, getThemeRoles } from '@/constants/avatar';
import { CHARACTER_REGISTRY } from '@/constants/character-registry';
import type { CharacterType, ColorTheme } from '@/types/avatar';

interface CharacterRendererProps {
  characterType: CharacterType;
  colorTheme: ColorTheme;
  className?: string;
  /** 접근성 라벨(장식용이면 생략) */
  title?: string;
}

/**
 * 캐릭터 종류 + 색상 테마를 받아 해당 SVG에 테마 색을 주입해 렌더한다.
 * 홈/마이페이지/스플래시 등 어디서든 이 컴포넌트만 재사용하면 된다.
 */
export function CharacterRenderer({
  characterType,
  colorTheme,
  className,
  title,
}: CharacterRendererProps) {
  const { Svg } = CHARACTER_REGISTRY[characterType] ?? CHARACTER_REGISTRY[DEFAULT_CHARACTER_TYPE];
  const roles = getThemeRoles(colorTheme);

  return <Svg {...roles} className={className} title={title} />;
}
