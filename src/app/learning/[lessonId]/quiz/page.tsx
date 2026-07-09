'use client';

import { useEffect, useState } from 'react';

import { useParams, useRouter } from 'next/navigation';

import { QuizExplanation } from '@/components/quiz/QuizExplanation';
import { QuizOptionButton } from '@/components/quiz/QuizOptionButton';
import { QuizQuestionCard } from '@/components/quiz/QuizQuestionCard';
import { QuizTimeoutModal } from '@/components/quiz/QuizTimeoutModal';
import { QuizTimer } from '@/components/quiz/QuizTimer';
import { ROUTES } from '@/constants/routes';
import { MOCK_QUIZ_QUESTIONS, QUIZ_TIME_LIMIT_SECONDS } from '@/mocks/quiz';

export default function QuizPage() {
  const router = useRouter();
  const { lessonId } = useParams<{ lessonId: string }>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(QUIZ_TIME_LIMIT_SECONDS);
  const [correctCount, setCorrectCount] = useState(0);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);

  const question = MOCK_QUIZ_QUESTIONS[currentIndex];
  const hasAnswered = selectedIndex !== null;
  const isLastQuestion = currentIndex === MOCK_QUIZ_QUESTIONS.length - 1;

  useEffect(() => {
    if (hasAnswered || showTimeoutModal) return;

    const timer = setTimeout(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setShowTimeoutModal(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [secondsLeft, hasAnswered, showTimeoutModal]);

  const handleSelect = (index: number) => {
    if (hasAnswered) return;
    setSelectedIndex(index);
  };

  const handleNext = () => {
    const finalCorrectCount =
      selectedIndex === question.correctIndex ? correctCount + 1 : correctCount;

    if (isLastQuestion) {
      const wrongCount = MOCK_QUIZ_QUESTIONS.length - finalCorrectCount;
      router.push(`/learning/${lessonId}/result?correct=${finalCorrectCount}&wrong=${wrongCount}`);
      return;
    }

    setCorrectCount(finalCorrectCount);
    setCurrentIndex((prev) => prev + 1);
    setSelectedIndex(null);
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setSelectedIndex(null);
    setSecondsLeft(QUIZ_TIME_LIMIT_SECONDS);
    setCorrectCount(0);
    setShowTimeoutModal(false);
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

      {showTimeoutModal && (
        <QuizTimeoutModal onRetry={handleRetry} onLeave={() => router.push(ROUTES.LEARNING)} />
      )}
    </>
  );
}
