'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { QuizExplanation } from '@/components/quiz/QuizExplanation';
import { QuizOptionButton } from '@/components/quiz/QuizOptionButton';
import { QuizQuestionCard } from '@/components/quiz/QuizQuestionCard';
import { QuizTimer } from '@/components/quiz/QuizTimer';
import { ROUTES } from '@/constants/routes';
import { MOCK_QUIZ_QUESTIONS, QUIZ_TIME_LIMIT_SECONDS } from '@/mocks/quiz';

export default function QuizPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(QUIZ_TIME_LIMIT_SECONDS);

  const question = MOCK_QUIZ_QUESTIONS[currentIndex];
  const hasAnswered = selectedIndex !== null;
  const isLastQuestion = currentIndex === MOCK_QUIZ_QUESTIONS.length - 1;
  const isTimeUp = secondsLeft === 0;

  useEffect(() => {
    if (hasAnswered) return;

    const timer = setTimeout(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // 시간 초과 시 선택 안 함(-1)으로 오답 처리하고 해설을 노출한다.
          setSelectedIndex(-1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [secondsLeft, hasAnswered]);

  const handleSelect = (index: number) => {
    if (hasAnswered) return;
    setSelectedIndex(index);
  };

  const handleNext = () => {
    if (isLastQuestion || isTimeUp) {
      // 레슨 완료 결과 화면은 후속 이슈. 지금은 학습 로드맵으로 복귀한다.
      // 시간 초과 시에도 남은 문제를 더 풀 수 없으므로 여기서 종료한다.
      router.push(ROUTES.LEARNING);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setSelectedIndex(null);
    // secondsLeft는 5문제 전체가 공유하는 타이머라 리셋하지 않는다.
  };

  return (
    <>
      <QuizTimer
        secondsLeft={secondsLeft}
        totalSeconds={QUIZ_TIME_LIMIT_SECONDS}
        currentIndex={currentIndex}
        totalQuestions={MOCK_QUIZ_QUESTIONS.length}
      />

      <QuizQuestionCard order={question.order} prompt={question.prompt} />

      <div className="flex flex-col gap-3 px-5">
        {question.options.map((option, index) => {
          const state =
            hasAnswered && index === question.correctIndex
              ? 'correct'
              : hasAnswered && index === selectedIndex
                ? 'wrong-selected'
                : 'default';

          return (
            <QuizOptionButton
              key={option}
              index={index}
              label={option}
              state={state}
              disabled={hasAnswered}
              onSelect={() => handleSelect(index)}
            />
          );
        })}
      </div>

      {hasAnswered && <QuizExplanation explanation={question.explanation} onNext={handleNext} />}
    </>
  );
}
