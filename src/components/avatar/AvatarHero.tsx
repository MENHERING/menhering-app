'use client';

import { useState } from 'react';

import dynamic from 'next/dynamic';

import { CharacterRenderer } from '@/components/avatar/CharacterRenderer';
import { DEFAULT_CHARACTER_TYPE } from '@/constants/avatar';
import { CHARACTER_REGISTRY } from '@/constants/character-registry';
import type { CharacterType, ColorTheme } from '@/types/avatar';
import type { Mood } from '@/types/mypage/model';

// Live2D 런타임(pixi + WebGL)은 무겁고 클라이언트 전용 → 필요할 때만 지연 로드.
const Live2DCharacter = dynamic(
  () => import('@/components/avatar/Live2DCharacter').then((m) => m.Live2DCharacter),
  { ssr: false },
);

interface AvatarHeroProps {
  characterType: CharacterType;
  colorTheme: ColorTheme;
  /** 감정 상태 → Live2D 표정. SVG 폴백에는 반영되지 않는다. */
  mood?: Mood;
  /** SVG 렌더 시 크기(Tailwind). 예: "size-32" */
  className?: string;
  /** Live2D 캔버스 한 변 픽셀. 기본 128. */
  size?: number;
  /** 접근성 라벨. */
  title?: string;
}

/**
 * 메인 프리뷰(히어로) 전용 렌더러. 레지스트리에 Live2D 모델이 있는 종류면 Live2D로,
 * 아니면(또는 로드 실패 시) SVG로 렌더한다. 픽커 썸네일·범용 재사용은 CharacterRenderer(SVG)를 그대로 쓴다.
 */
export function AvatarHero({
  characterType,
  colorTheme,
  mood,
  className,
  size = 128,
  title,
}: AvatarHeroProps) {
  // 미등록 characterType(DB 구값·오타)이 와도 크래시하지 않고 기본 캐릭터로 폴백.
  const spec = CHARACTER_REGISTRY[characterType] ?? CHARACTER_REGISTRY[DEFAULT_CHARACTER_TYPE];
  const [failed, setFailed] = useState(false);

  // 캐릭터가 바뀌면 실패 상태를 렌더 중에 초기화(effect 불필요) →
  // 한 캐릭터의 Live2D 실패가 다른 캐릭터까지 SVG로 가두지 않게.
  const [trackedType, setTrackedType] = useState(characterType);
  if (trackedType !== characterType) {
    setTrackedType(characterType);
    setFailed(false);
  }

  if (spec.live2d && !failed) {
    return (
      <Live2DCharacter
        modelUrl={spec.live2d.modelUrl}
        colorTheme={colorTheme}
        mood={mood}
        size={size}
        interactive
        className={className}
        title={title}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <CharacterRenderer
      characterType={characterType}
      colorTheme={colorTheme}
      className={className}
      title={title}
    />
  );
}
