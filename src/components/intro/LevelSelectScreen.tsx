'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/common/Button';
import { cn } from '@/lib/cn';

interface Level {
  step: number;
  title: string;
  desc: string;
}

// 실력 단계
export const LEVELS: Level[] = [
  { step: 1, title: '입문', desc: 'HTML/CSS 기초부터 천천히' },
  { step: 2, title: '초급', desc: '기본 문법과 화면 구현 중심' },
  { step: 3, title: '중급', desc: '면접 단골 개념과 실전 문제' },
  { step: 4, title: '고급', desc: '상태관리, 비동기, 최적화' },
  { step: 5, title: '전문가', desc: '아키텍처와 까다로운 엣지케이스' },
];

export function LevelSelectScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState(3);

  const handleComplete = () => {
    router.push('/home');
  };

  return (
    <div className="bg-sand flex min-h-dvh w-full flex-col items-center px-6">
      <div className="flex w-full max-w-[430px] flex-1 flex-col">
        {/* 헤더 */}
        <div className="mt-12 flex flex-col gap-2">
          <h1 className="text-plum text-2xl font-extrabold tracking-tight">
            내 실력에 맞게 시작하기
          </h1>
          <p className="text-primary/70 text-sm leading-6 font-medium">
            직접 1~5단계를 고르거나 실력테스트로 추천 레벨을 받을 수 있어요.
          </p>
        </div>

        {/* 레벨 리스트 */}
        <ul className="mt-6 flex flex-col gap-3">
          {LEVELS.map(({ step, title, desc }) => {
            const isActive = selected === step;
            return (
              <li key={step}>
                <button
                  type="button"
                  onClick={() => setSelected(step)}
                  aria-pressed={isActive}
                  className={cn(
                    'flex w-full items-center gap-4 rounded-2xl bg-white px-4 py-4 text-left shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-shadow',
                    isActive && 'ring-coral ring-2',
                  )}
                >
                  <span className="bg-primary flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white">
                    {step}
                  </span>
                  <span className="flex flex-1 flex-col">
                    <span className="text-plum text-base font-bold">{title}</span>
                    <span className="text-primary/60 text-xs font-medium">{desc}</span>
                  </span>
                  <span className={cn('text-lg', isActive ? 'text-coral' : 'text-primary/30')}>
                    {isActive ? '✓' : '›'}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* CTA */}
        <div className="mt-auto mb-10 flex flex-col gap-3 pt-6">
          <Button variant="secondary" isFullWidth onClick={() => router.push('/level-test')}>
            간단 테스트로 추천받기
          </Button>
          <Button variant="primary" isFullWidth onClick={handleComplete}>
            선택 완료하고 홈으로
          </Button>
        </div>
      </div>
    </div>
  );
}
