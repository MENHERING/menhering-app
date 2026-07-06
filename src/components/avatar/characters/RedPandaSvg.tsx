import { CharacterSvgFrame, Eyes, Mouth } from '@/components/avatar/characters/features';
import type { CharacterSvgProps } from '@/components/avatar/characters/types';

// 레서판다: 뾰족한 귀 + 흰 얼굴 무늬가 특징.
export function RedPandaSvg({ body, secondary, accent, className, title }: CharacterSvgProps) {
  return (
    <CharacterSvgFrame className={className} title={title}>
      {/* 꼬리 */}
      <ellipse cx="150" cy="150" rx="18" ry="30" fill={body} transform="rotate(35 150 150)" />
      <ellipse cx="156" cy="162" rx="10" ry="8" fill={secondary} transform="rotate(35 156 162)" />

      {/* 귀 */}
      <ellipse cx="56" cy="60" rx="22" ry="24" fill={body} />
      <ellipse cx="144" cy="60" rx="22" ry="24" fill={body} />
      <ellipse cx="56" cy="64" rx="11" ry="13" fill={secondary} />
      <ellipse cx="144" cy="64" rx="11" ry="13" fill={secondary} />

      {/* 머리 */}
      <ellipse cx="100" cy="110" rx="64" ry="58" fill={body} />

      {/* 흰 얼굴 무늬 */}
      <ellipse cx="74" cy="112" rx="27" ry="31" fill={secondary} />
      <ellipse cx="126" cy="112" rx="27" ry="31" fill={secondary} />
      <ellipse cx="100" cy="134" rx="26" ry="22" fill={secondary} />

      {/* 눈 */}
      <Eyes cy={106} fill={accent} />

      {/* 코 & 입 */}
      <ellipse cx="100" cy="126" rx="6" ry="4.5" fill={accent} />
      <Mouth topY={130} bottomY={138} stroke={accent} />
    </CharacterSvgFrame>
  );
}
