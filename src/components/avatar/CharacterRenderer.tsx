import { CatSvg } from '@/components/avatar/characters/CatSvg';
import { DogSvg } from '@/components/avatar/characters/DogSvg';
import { RabbitSvg } from '@/components/avatar/characters/RabbitSvg';
import { RedPandaSvg } from '@/components/avatar/characters/RedPandaSvg';
import type { CharacterSvgProps } from '@/components/avatar/characters/types';
import { getThemeRoles } from '@/constants/avatar';
import type { CharacterType, ColorTheme } from '@/types/avatar';

type CharacterSvg = (props: CharacterSvgProps) => React.ReactElement;

const CHARACTER_SVG: Record<CharacterType, CharacterSvg> = {
  레서판다: RedPandaSvg,
  토끼: RabbitSvg,
  강아지: DogSvg,
  고양이: CatSvg,
};

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
  const Svg = CHARACTER_SVG[characterType] ?? RedPandaSvg;
  const roles = getThemeRoles(colorTheme);

  return <Svg {...roles} className={className} title={title} />;
}
