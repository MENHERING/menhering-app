'use client';

import { useEffect, useId, useState } from 'react';

import Image from 'next/image';

import { AvatarHero } from '@/components/avatar/AvatarHero';
import { MIN_HAPPINESS_FILL_PERCENT } from '@/components/common/gauge-constants';
import { DEFAULT_CHARACTER_TYPE, DEFAULT_COLOR_THEME } from '@/constants/avatar';
import type { CharacterType, ColorTheme } from '@/types/avatar';
import type { Mood } from '@/types/mypage/model';

interface QuizAvatarRingProps {
  size?: number;
  // 0(멘헤라/우울)~100(행복) — 이 비율만큼 링 호(arc) 길이를 채운다.
  happinessPercent?: number;
  // 방금 오른 만큼(있으면) happinessPercent - gainPercent에서 시작해 최종 값까지
  // 애니메이션한다. 없으면(다른 화면들처럼 "방금 오른 값" 개념이 없으면) 애니메이션 없이
  // happinessPercent를 그대로 보여준다.
  gainPercent?: number;
  imageSrc?: string;
  imageAlt?: string;
  badge?: React.ReactNode;
  characterType?: CharacterType;
  colorTheme?: ColorTheme;
  // Live2D(AvatarHero)로 렌더할지. Live2D는 싱글톤(동시 1개만 마운트 가능)이라
  // 결과 화면처럼 한 페이지에 단독으로 뜨는 자리에만 true로 쓴다. 여러 인스턴스가
  // 동시에 뜰 수 있는 자리(퀴즈 타임아웃 모달 등)는 기본값(정적 이미지)을 유지해야 한다.
  useHero?: boolean;
  mood?: Mood;
}

export function QuizAvatarRing({
  size = 160,
  happinessPercent = 100,
  gainPercent = 0,
  badge,
  characterType = DEFAULT_CHARACTER_TYPE,
  colorTheme = DEFAULT_COLOR_THEME,
  useHero = false,
  mood,
}: QuizAvatarRingProps) {
  const gradientId = useId();
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // 오르기 전 값에서 시작해, 마운트 직후 최종 값으로 애니메이션한다(gainPercent가 없으면
  // 시작 값 = 최종 값이라 사실상 정적으로 그대로 보인다).
  const [displayPercent, setDisplayPercent] = useState(Math.max(0, happinessPercent - gainPercent));

  useEffect(() => {
    const frame = requestAnimationFrame(() => setDisplayPercent(happinessPercent));

    return () => cancelAnimationFrame(frame);
  }, [happinessPercent]);

  const ratio = Math.min(Math.max(displayPercent, 0), 100) / 100;
  const minRatio = MIN_HAPPINESS_FILL_PERCENT / 100;
  const arcRatio = minRatio + (1 - minRatio) * ratio;
  const dashOffset = circumference * (1 - arcRatio);

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg width={size} height={size} aria-hidden className="-rotate-90">
        <defs>
          {/* 멘헤라(파랑)에서 행복(코랄)까지 항상 뚜렷하게 보이는 고정 그라데이션. */}
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--coral)" />
            <stop offset="100%" stopColor="var(--mood-sad)" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--cream)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="transition-[stroke-dashoffset] duration-[1400ms] ease-out"
        />
      </svg>

      <div className="absolute inset-3 flex items-center justify-center overflow-hidden rounded-full">
        {useHero ? (
          <AvatarHero
            characterType={characterType}
            colorTheme={colorTheme}
            mood={mood}
            size={size - 24}
            title="내 아바타"
          />
        ) : (
          <Image
            src="/images/avatar/menhering_1_img.webp"
            alt="멘헤링 마스코트"
            fill
            className="object-cover"
          />
        )}
      </div>

      {badge && <div className="absolute right-0 bottom-0">{badge}</div>}
    </div>
  );
}
