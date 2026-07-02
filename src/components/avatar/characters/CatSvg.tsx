import { CharacterSvgFrame, Eyes, Mouth } from '@/components/avatar/characters/features';
import type { CharacterSvgProps } from '@/components/avatar/characters/types';

// 고양이: 삼각 귀 + 수염이 특징.
export function CatSvg({ body, secondary, accent, className, title }: CharacterSvgProps) {
  return (
    <CharacterSvgFrame className={className} title={title}>
      {/* 삼각 귀 */}
      <path d="M52 88 L44 34 L92 66 Z" fill={body} />
      <path d="M148 88 L156 34 L108 66 Z" fill={body} />
      <path d="M58 80 L54 48 L82 66 Z" fill={secondary} />
      <path d="M142 80 L146 48 L118 66 Z" fill={secondary} />

      {/* 머리 */}
      <ellipse cx="100" cy="112" rx="60" ry="54" fill={body} />

      {/* 얼굴 무늬 */}
      <ellipse cx="100" cy="126" rx="30" ry="26" fill={secondary} />

      {/* 눈 */}
      <Eyes cy={108} rx={8.5} ry={11} fill={accent} />

      {/* 수염 */}
      <path
        d="M70 124 H40 M70 132 H42 M130 124 H160 M130 132 H158"
        stroke={accent}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />

      {/* 코 & 입 */}
      <path d="M94 124 H106 L100 130 Z" fill={accent} />
      <Mouth topY={130} bottomY={136} width={12} stroke={accent} />
    </CharacterSvgFrame>
  );
}
