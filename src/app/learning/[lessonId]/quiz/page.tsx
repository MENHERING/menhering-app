'use client';

import { useEffect, useState } from 'react';

import { useParams, useRouter } from 'next/navigation';

import { QuizExplanation } from '@/components/quiz/QuizExplanation';
import { QuizOptionButton } from '@/components/quiz/QuizOptionButton';
import { QuizQuestionCard } from '@/components/quiz/QuizQuestionCard';
import { QuizTimeoutModal } from '@/components/quiz/QuizTimeoutModal';
import { QuizTimer } from '@/components/quiz/QuizTimer';
import { ROUTES } from '@/constants/routes';
import { useQuiz } from '@/hooks/learning/use-quiz';
import { useSubmitQuiz } from '@/hooks/learning/use-submit-quiz';
import { parseLessonId } from '@/lib/parse-lesson-id';
import { QUIZ_TIME_LIMIT_SECONDS } from '@/mocks/quiz';

export default function QuizPage() {
  const router = useRouter();
  const { lessonId } = useParams<{ lessonId: string }>();
  const { level, stage } = parseLessonId(lessonId);

  const { data: questions, isLoading, isError } = useQuiz(level, stage);
  const submitQuiz = useSubmitQuiz();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(QUIZ_TIME_LIMIT_SECONDS);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  // { questionId: selectedOption(1~4) } 제출용 누적. 정답 판정은 서버가 한다.
  const [answers, setAnswers] = useState<Record<string, number>>({});
  // useState의 지연 초기화 함수는 마운트 시 한 번만 호출되므로 순수성 규칙에 안전하다.
  const [startedAt, setStartedAt] = useState(() => Date.now());

  const question = questions?.[currentIndex];
  const hasAnswered = selectedIndex !== null;
  const isLastQuestion = questions ? currentIndex === questions.length - 1 : false;

  useEffect(() => {
    if (!questions || hasAnswered || showTimeoutModal) return;

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
  }, [questions, secondsLeft, hasAnswered, showTimeoutModal]);

  if (isError) {
    return (
      <p className="text-wrong px-5 py-16 text-center text-sm">
        문제를 불러오지 못했어요. 다시 시도해주세요.
      </p>
    );
  }

  if (isLoading || !question) {
    return <p className="text-brown-soft px-5 py-16 text-center text-sm">불러오는 중...</p>;
  }

  const handleSelect = (index: number) => {
    if (hasAnswered) return;
    setSelectedIndex(index);
  };

  const handleNext = () => {
    const finalAnswers = { ...answers, [question.id]: (selectedIndex ?? 0) + 1 };

    if (isLastQuestion) {
      const durationSec = Math.round((Date.now() - startedAt) / 1000);

      submitQuiz.mutate(
        {
          level,
          stage,
          durationSec,
          answers: Object.entries(finalAnswers).map(([questionId, selectedOption]) => ({
            questionId,
            selectedOption,
          })),
        },
        {
          onSuccess: (result) => {
            // level/stage는 결과 화면이 "다음 스테이지" 버튼의 실제 목적지를 계산하는 데 쓴다.
            // xpReward/coinReward/moodGain은 서버(첫 클리어 판정)가 이미 계산한 값을 그대로 표시만 한다.
            router.push(
              `/learning/${lessonId}/result?correct=${result.correctCount}&wrong=${result.wrongCount}&level=${encodeURIComponent(level)}&stage=${stage}&success=${result.isSuccess}&xp=${result.xpReward}&coin=${result.coinReward}&moodGain=${result.moodGain}`,
            );
          },
        },
      );
      return;
    }

    setAnswers(finalAnswers);
    setCurrentIndex((prev) => prev + 1);
    setSelectedIndex(null);
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setSelectedIndex(null);
    setSecondsLeft(QUIZ_TIME_LIMIT_SECONDS);
    setAnswers({});
    setShowTimeoutModal(false);
    setStartedAt(Date.now());
  };

  return (
    <>
      <QuizTimer
        secondsLeft={secondsLeft}
        totalSeconds={QUIZ_TIME_LIMIT_SECONDS}
        currentIndex={currentIndex}
        totalQuestions={questions.length}
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
        <QuizTimeoutModal
          onRetry={handleRetry}
          onLeave={() => router.push(`${ROUTES.LEARNING}?level=${encodeURIComponent(level)}`)}
        />
      )}
    </>
  );
}
