'use client';

import { useId } from 'react';

import Image from 'next/image';

interface QuizAvatarRingProps {
  size?: number;
  // 0(멘헤라/우울)~100(행복) — 이 비율만큼 링 호(arc) 길이를 채운다.
  happinessPercent?: number;
  badge?: React.ReactNode;
}

// 0%여도 색이 살짝은 보이도록 최소 호 길이를 보장한다.
const MIN_ARC_RATIO = 0.12;

export function QuizAvatarRing({ size = 160, happinessPercent = 100, badge }: QuizAvatarRingProps) {
  const gradientId = useId();
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = Math.min(Math.max(happinessPercent, 0), 100) / 100;
  const arcRatio = MIN_ARC_RATIO + (1 - MIN_ARC_RATIO) * ratio;
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
        />
      </svg>

      <div className="absolute inset-3 overflow-hidden rounded-full">
        <Image src="/images/avatar/panda.png" alt="멘헤링 마스코트" fill className="object-cover" />
      </div>

      {badge && <div className="absolute right-0 bottom-0">{badge}</div>}
    </div>
  );
}
