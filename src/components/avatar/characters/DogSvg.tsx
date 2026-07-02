import { CharacterSvgFrame, Eyes, Mouth } from '@/components/avatar/characters/features';
import type { CharacterSvgProps } from '@/components/avatar/characters/types';

// 강아지: 양옆으로 늘어진 접힌 귀가 특징.
export function DogSvg({ body, secondary, accent, className, title }: CharacterSvgProps) {
  return (
    <CharacterSvgFrame className={className} title={title}>
      {/* 접힌 귀 */}
      <ellipse cx="46" cy="118" rx="18" ry="34" fill={accent} transform="rotate(20 46 118)" />
      <ellipse cx="154" cy="118" rx="18" ry="34" fill={accent} transform="rotate(-20 154 118)" />

      {/* 머리 */}
      <ellipse cx="100" cy="106" rx="62" ry="56" fill={body} />

      {/* 주둥이 */}
      <ellipse cx="100" cy="132" rx="34" ry="28" fill={secondary} />

      {/* 눈 */}
      <Eyes cy={100} fill={accent} />

      {/* 코 & 입 */}
      <ellipse cx="100" cy="122" rx="8" ry="6" fill={accent} />
      <Mouth topY={128} bottomY={138} width={15} ctrlY={6} stroke={accent} />
    </CharacterSvgFrame>
  );
}
