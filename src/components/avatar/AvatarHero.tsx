'use client';

import { useState } from 'react';

import dynamic from 'next/dynamic';

import { CharacterRenderer } from '@/components/avatar/CharacterRenderer';
import { MoodBackdrop } from '@/components/avatar/MoodBackdrop';
import { MoodSymbol } from '@/components/avatar/MoodSymbol';
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
  /** 감정 상태 → Live2D 표정 + 만화적 심볼·기운 배경. SVG 폴백에는 표정을 뺀 심볼·기운 배경이 반영된다. */
  mood?: Mood;
  /** false면 Live2D 털에 테마색을 곱하지 않고 원본 텍스처 색으로 렌더(검증용). 기본 true. */
  tinted?: boolean;
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
  tinted,
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

  // 감정 오버레이는 캔버스/SVG와 형제인 절대배치라 relative 래퍼가 필요하다.
  // MoodBackdrop은 캐릭터보다 먼저(=뒤에), MoodSymbol은 나중에(=앞에) 그려진다.
  //
  // MoodSymbol의 심볼 좌표는 렌더러마다 실루엣 비율이 달라 앵커를 나눠 쓴다:
  // Live2D 경로는 캔버스 실측값(live2d.moodAnchors), SVG 폴백은 viewBox 기준값(svgMoodAnchors).
  // MoodBackdrop은 캔버스 중앙의 흐릿한 타원이라 렌더러와 무관하게 안전하다.
  // 로드 실패(failed) 시 Live2D 스펙이 있어도 SVG로 폴백한다. 래퍼·배경·심볼 층 구성은 두 경로가 같다.
  const live2d = failed ? undefined : spec.live2d;

  return (
    <div className="relative">
      <MoodBackdrop mood={mood} />
      {live2d ? (
        <Live2DCharacter
          modelUrl={live2d.modelUrl}
          colorTheme={colorTheme}
          mood={mood}
          tinted={tinted}
          size={size}
          interactive
          className={className}
          title={title}
          onError={() => setFailed(true)}
        />
      ) : (
        <CharacterRenderer
          characterType={characterType}
          colorTheme={colorTheme}
          className={className}
          title={title}
        />
      )}
      <MoodSymbol mood={mood} anchors={live2d ? live2d.moodAnchors : spec.svgMoodAnchors} />
    </div>
  );
}
