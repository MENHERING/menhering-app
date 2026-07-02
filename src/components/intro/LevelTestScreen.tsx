'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/common/Button';
import { Header } from '@/components/common/Header';
import { cn } from '@/lib/cn';

interface Question {
  title: string;
  options: string[];
}

// 실력테스트 문항
const QUESTIONS: Question[] = [
  {
    title: '요즘 감정 상태를 가장 잘 표현하는 문장은?',
    options: [
      '천천히 다시 해보고 싶어요',
      '도움 없이 해낼 수 있어요',
      '조금 어려워도 괜찮아요',
      '새로운 도전을 원해요',
    ],
  },
  {
    title: '코드를 읽을 때 나는?',
    options: [
      '한 줄씩 천천히 따라가요',
      '전체 흐름부터 파악해요',
      '핵심 로직만 골라 봐요',
      '개선점부터 눈에 들어와요',
    ],
  },
  {
    title: '새 기술을 만나면?',
    options: [
      '기초 문서부터 읽어요',
      '예제를 따라 만들어봐요',
      '바로 프로젝트에 써봐요',
      '내부 동작까지 파고들어요',
    ],
  },
];

const LETTERS = ['A', 'B', 'C', 'D'];

// 진행바 폭 — 문항 수(QUESTIONS.length)에 맞춘 분수 클래스 (인라인 스타일 대체)
const PROGRESS_WIDTH = ['w-1/3', 'w-2/3', 'w-full'];

// TODO: 실제 추천 알고리즘으로 교체. 임시: 선택지 인덱스(0~3) 평균 → 레벨 1~5 매핑
function calcRecommendedStep(answers: number[]): number {
  if (answers.length === 0) return 2;
  const avg = answers.reduce((sum, a) => sum + a, 0) / answers.length;
  const step = Math.round(1 + (avg / 3) * 4);
  return Math.min(5, Math.max(1, step));
}

export function LevelTestScreen() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  const question = QUESTIONS[index];
  const selected = answers[index];
  const isLast = index === QUESTIONS.length - 1;

  const handleSelect = (optionIndex: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = optionIndex;
      return next;
    });
  };

  const handleBack = () => {
    if (index === 0) {
      router.back();
      return;
    }
    setIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    if (isLast) {
      const step = calcRecommendedStep(answers);
      router.push(`/level-test/result?step=${step}`);
      return;
    }
    setIndex((prev) => prev + 1);
  };

  return (
    <div className="bg-sand flex min-h-dvh w-full flex-col items-center">
      <Header title="레벨 테스트" leftType="back" onLeftPress={handleBack} />
      <div className="flex w-full max-w-[430px] flex-1 flex-col px-6">
        {/* 진행바 */}
        <div className="mt-6 flex flex-col items-center gap-2">
          <div className="bg-coral-soft/50 h-1.5 w-full overflow-hidden rounded-full">
            <div
              className={cn(
                'bg-coral h-full rounded-full transition-[width]',
                PROGRESS_WIDTH[index] ?? 'w-full',
              )}
            />
          </div>
          <span className="text-coral text-xs font-bold">
            {index + 1} / {QUESTIONS.length}
          </span>
        </div>

        {/* 질문 카드 */}
        <div className="mt-6 flex flex-col items-center gap-4 rounded-2xl bg-white px-6 py-8 shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
          <span className="text-coral text-sm font-bold">Q{index + 1}</span>
          <p className="text-plum text-center text-lg leading-7 font-extrabold">{question.title}</p>
        </div>

        {/* 선택지 */}
        <ul className="mt-6 flex flex-col gap-3">
          {question.options.map((option, optionIndex) => {
            const isActive = selected === optionIndex;
            return (
              <li key={option}>
                <button
                  type="button"
                  onClick={() => handleSelect(optionIndex)}
                  aria-pressed={isActive}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-2xl bg-white px-4 py-4 text-left shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-shadow',
                    isActive && 'ring-coral ring-2',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                      isActive ? 'bg-coral text-white' : 'bg-coral-soft/50 text-coral',
                    )}
                  >
                    {LETTERS[optionIndex]}
                  </span>
                  <span className="text-plum text-sm font-medium">{option}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-auto mb-10 pt-6">
          <Button
            variant="primary"
            isFullWidth
            disabled={selected === undefined}
            onClick={handleNext}
          >
            {isLast ? '결과 보기' : '다음'}
          </Button>
        </div>
      </div>
    </div>
  );
}
