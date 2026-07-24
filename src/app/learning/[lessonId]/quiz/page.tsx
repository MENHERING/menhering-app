'use client';

import { useEffect, useState } from 'react';

import { useParams, useRouter } from 'next/navigation';

import { Button } from '@/components/common/Button';
import { QuizOptionButton } from '@/components/quiz/QuizOptionButton';
import { QuizQuestionCard } from '@/components/quiz/QuizQuestionCard';
import { QuizTimeoutModal } from '@/components/quiz/QuizTimeoutModal';
import { QuizTimer } from '@/components/quiz/QuizTimer';
import { ROUTES } from '@/constants/routes';
import {
  AVATAR_SELECT_SOUND,
  AVATAR_SFX_VOLUME,
  QUIZ_CORRECT_SOUND,
  QUIZ_WRONG_SOUND,
} from '@/constants/sounds';
import { useQuiz } from '@/hooks/learning/use-quiz';
import { useSubmitQuiz } from '@/hooks/learning/use-submit-quiz';
import { useSound } from '@/hooks/use-sound';
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

  const playSelect = useSound(AVATAR_SELECT_SOUND, AVATAR_SFX_VOLUME);
  const playCorrect = useSound(QUIZ_CORRECT_SOUND, AVATAR_SFX_VOLUME);
  const playWrong = useSound(QUIZ_WRONG_SOUND, AVATAR_SFX_VOLUME);

  const question = questions?.[currentIndex];
  const hasAnswered = selectedIndex !== null;
  const isLastQuestion = questions ? currentIndex === questions.length - 1 : false;

  // 답을 고른 뒤에도(다음 문제로 넘어가기 전까지) 시간은 계속 흐른다.
  useEffect(() => {
    if (!questions || showTimeoutModal) return;

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
  }, [questions, secondsLeft, showTimeoutModal]);

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

  // 다음 문제로 넘어가기 전까지는 몇 번이든 답을 바꿀 수 있다.
  const handleSelect = (index: number) => {
    setSelectedIndex(index);
    playSelect();
  };

  const handleNext = () => {
    const finalAnswers = { ...answers, [question.id]: (selectedIndex ?? 0) + 1 };

    // 정답/오답 소리는 "선택할 때"가 아니라 "다음을 누를 때" 낸다. 이 화면은 넘어가기 전까지 답을
    // 몇 번이든 바꿀 수 있어서, 선택마다 소리를 내면 보기를 하나씩 눌러보며 정답을 찾아낼 수 있다.
    // 다음을 누른 시점엔 답이 확정이라(퀴즈 안에 뒤로가기 없음) 그 문제가 없다.
    // 화면 표시는 지금처럼 중립을 유지한다 — 정답 공개는 결과 화면과 오답노트가 담당한다.
    if (selectedIndex === question.correctIndex) {
      playCorrect();
    } else {
      playWrong();
    }

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
          const state = hasAnswered && index === selectedIndex ? 'selected' : 'default';

          return (
            <QuizOptionButton
              key={option}
              index={index}
              label={option}
              state={state}
              disabled={false}
              onSelect={() => handleSelect(index)}
            />
          );
        })}
      </div>

      {hasAnswered && (
        <div className="px-5">
          <Button
            variant="primary"
            size="lg"
            isFullWidth
            isLoading={submitQuiz.isPending}
            onClick={handleNext}
          >
            {isLastQuestion ? '결과 보기' : '다음 문제'}
          </Button>
        </div>
      )}

      {showTimeoutModal && (
        <QuizTimeoutModal
          onRetry={handleRetry}
          onLeave={() => router.push(`${ROUTES.LEARNING}?level=${encodeURIComponent(level)}`)}
        />
      )}
    </>
  );
}
