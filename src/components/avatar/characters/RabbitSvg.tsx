import { CharacterSvgFrame, Eyes, Mouth } from '@/components/avatar/characters/features';
import type { CharacterSvgProps } from '@/components/avatar/characters/types';

// 토끼: 길게 선 두 귀가 특징.
export function RabbitSvg({ body, secondary, accent, className, title }: CharacterSvgProps) {
  return (
    <CharacterSvgFrame className={className} title={title}>
      {/* 귀 */}
      <ellipse cx="82" cy="48" rx="13" ry="42" fill={body} transform="rotate(-9 82 48)" />
      <ellipse cx="118" cy="48" rx="13" ry="42" fill={body} transform="rotate(9 118 48)" />
      <ellipse cx="82" cy="50" rx="6" ry="30" fill={secondary} transform="rotate(-9 82 50)" />
      <ellipse cx="118" cy="50" rx="6" ry="30" fill={secondary} transform="rotate(9 118 50)" />

      {/* 머리 */}
      <ellipse cx="100" cy="118" rx="60" ry="54" fill={body} />

      {/* 얼굴 무늬 */}
      <ellipse cx="100" cy="132" rx="30" ry="26" fill={secondary} />

      {/* 눈 */}
      <Eyes cy={114} rx={8.5} fill={accent} />

      {/* 코 & 입 */}
      <ellipse cx="100" cy="132" rx="5.5" ry="4" fill={accent} />
      <Mouth topY={136} bottomY={143} stroke={accent} />
    </CharacterSvgFrame>
  );
}
