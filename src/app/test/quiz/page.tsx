'use client';

import { useState } from 'react';

import { notFound } from 'next/navigation';

import { QuizAvatarRing } from '@/components/common/AvatarRing';
import { HappinessGauge } from '@/components/quiz/HappinessGauge';
import { QuizOptionButton } from '@/components/quiz/QuizOptionButton';
import { QuizQuestionCard } from '@/components/quiz/QuizQuestionCard';
import { QuizResultActions } from '@/components/quiz/QuizResultActions';
import { QuizResultStats } from '@/components/quiz/QuizResultStats';
import { QuizTimeoutModal } from '@/components/quiz/QuizTimeoutModal';
import { QuizTimer } from '@/components/quiz/QuizTimer';
import { QuizXpBadge } from '@/components/quiz/QuizXpBadge';
import { cn } from '@/lib/cn';
import { MOCK_QUIZ_QUESTIONS, QUIZ_TIME_LIMIT_SECONDS } from '@/mocks/quiz';

// Live2D(AvatarHero)는 싱글톤이라 동시에 여러 개를 마운트하면 안 된다(캔버스 충돌).
// 데모에서 5단계를 다 보여주되 한 번에 하나만 Live2D로 렌더하고 나머지는 버튼으로 전환한다.
const MOOD_PREVIEWS = [
  { happinessPercent: 10, mood: '화남' },
  { happinessPercent: 30, mood: '지침' },
  { happinessPercent: 50, mood: '우울' },
  { happinessPercent: 70, mood: '보통' },
  { happinessPercent: 90, mood: '행복' },
] as const;

export default function TestQuizPage() {
  if (process.env.NODE_ENV !== 'development') notFound();

  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [selectedMoodIndex, setSelectedMoodIndex] = useState(0);
  const question = MOCK_QUIZ_QUESTIONS[0];
  const selectedPreview = MOOD_PREVIEWS[selectedMoodIndex];

  return (
    <main className="flex min-h-screen flex-col gap-8 bg-gray-50 px-4 py-16">
      {/* case 01: QuizTimer */}
      <div className="rounded-2xl bg-white p-6">
        <QuizTimer
          secondsLeft={25}
          totalSeconds={QUIZ_TIME_LIMIT_SECONDS}
          currentIndex={0}
          totalQuestions={MOCK_QUIZ_QUESTIONS.length}
        />
      </div>

      {/* case 02: QuizQuestionCard */}
      <QuizQuestionCard order={question.order} prompt={question.prompt} />

      {/* case 03: QuizOptionButton - default / selected */}
      <div className="flex flex-col gap-3">
        <QuizOptionButton
          index={0}
          label="기본 상태"
          state="default"
          disabled={false}
          onSelect={() => {}}
        />
        <QuizOptionButton
          index={1}
          label="내가 고른 상태"
          state="selected"
          disabled
          onSelect={() => {}}
        />
      </div>

      {/* case 05: QuizAvatarRing - 정적 이미지(기본) / Live2D 5단계 감정(결과 화면 전용, 한 번에 하나만 마운트) */}
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-white p-6">
        <div className="flex flex-wrap justify-center gap-4">
          <div className="flex flex-col items-center gap-2">
            <QuizAvatarRing />
            <span className="text-brown-soft text-xs">기본(정적 이미지)</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <QuizAvatarRing
              useHero
              happinessPercent={selectedPreview.happinessPercent}
              mood={selectedPreview.mood}
            />
            <span className="text-brown-soft text-xs">
              {selectedPreview.mood} ({selectedPreview.happinessPercent}%)
            </span>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {MOOD_PREVIEWS.map((preview, index) => (
            <button
              key={preview.mood}
              type="button"
              onClick={() => setSelectedMoodIndex(index)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-semibold',
                index === selectedMoodIndex
                  ? 'bg-coral text-white'
                  : 'bg-locked/30 text-brown-soft',
              )}
            >
              {preview.mood}
            </button>
          ))}
        </div>
      </div>

      {/* case 06: HappinessGauge */}
      <HappinessGauge happinessPercent={80} gainPercent={32} />

      {/* case 07: QuizResultStats */}
      <QuizResultStats correctCount={5} wrongCount={0} />

      {/* case 09: QuizXpBadge */}
      <div className="flex justify-center">
        <QuizXpBadge xp={50} />
      </div>

      {/* case 10: 실패 결과 헤더 */}
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-white p-6">
        <QuizAvatarRing happinessPercent={18} />
        <div className="flex flex-col items-center gap-2 text-center">
          <h2 className="text-ink text-xl font-extrabold">아쉬워요!</h2>
          <p className="text-brown-soft text-sm">이번 스테이지는 통과하지 못했어요</p>
        </div>
      </div>

      {/* case 11: QuizResultActions - 성공 / 실패 */}
      <div className="flex flex-col gap-4 rounded-2xl bg-white p-6">
        <QuizResultActions
          isSuccess
          wrongCount={2}
          nextLessonId="입문-2"
          level="입문"
          lessonId="입문-1"
        />
        <QuizResultActions
          isSuccess={false}
          wrongCount={4}
          nextLessonId="입문-2"
          level="입문"
          lessonId="입문-1"
        />
      </div>

      {/* case 08: QuizTimeoutModal */}
      <button
        type="button"
        onClick={() => setShowTimeoutModal(true)}
        className="rounded-2xl bg-white p-4 text-sm font-semibold"
      >
        타임아웃 모달 열기
      </button>
      {showTimeoutModal && (
        <QuizTimeoutModal
          onRetry={() => setShowTimeoutModal(false)}
          onLeave={() => setShowTimeoutModal(false)}
        />
      )}
    </main>
  );
}
