'use client';

import { useId } from 'react';

import Image from 'next/image';

interface QuizAvatarRingProps {
  size?: number;
  badge?: React.ReactNode;
}

export function QuizAvatarRing({ size = 160, badge }: QuizAvatarRingProps) {
  const gradientId = useId();
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // 장식용 링이라 데이터 비율이 아닌 고정 비율(85%)만 채워 도넛 형태로 표현한다.
  const dashOffset = circumference * 0.15;

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg width={size} height={size} aria-hidden className="-rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--coral)" />
            <stop offset="100%" stopColor="var(--primary-soft)" />
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
