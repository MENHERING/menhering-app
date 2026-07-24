'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/common/Button';
import { Header } from '@/components/common/Header';
import { OnboardingError } from '@/components/intro/OnboardingError';
import { OnboardingLoading } from '@/components/intro/OnboardingLoading';
import { ROUTES } from '@/constants/routes';
import { AVATAR_SELECT_SOUND, AVATAR_SFX_VOLUME } from '@/constants/sounds';
import { useLevelTestQuestions } from '@/hooks/level-test/use-level-test';
import { useSound } from '@/hooks/use-sound';
import { cn } from '@/lib/cn';
import type { LevelTestQuestion } from '@/schemas/level-test.schema';

const LETTERS = ['A', 'B', 'C', 'D'];

// 추천 레벨 판정 — "계단 오르기" 방식.
//
// 문항은 쉬운 난이도부터 순서대로 온다(입문→전문가, 각 1문항). 첫 문항부터 차례로 밟아 올라가다가
// 처음 틀린 지점에서 멈추고, 밟고 올라선 마지막 계단의 난이도(step)를 추천 레벨로 준다.
// 첫 문항부터 틀리면 입문(1).
//
// 왜 "맞힌 것 중 가장 어려운 난이도"가 아닌가:
//   답안이 O O X O X 일 때 그 방식은 고급(4)을 추천한다 — 중급에서 막힌 사람인데 고급 문제를
//   찍어서 맞춘 것뿐이다. 4지선다라 고급·전문가 둘 중 하나가 우연히 맞을 확률이 44%나 되어,
//   아무렇게나 찍어도 열에 넷은 고급 이상을 받는다. 계단 방식은 입문부터 맞혀야 올라가므로
//   찍기로는 75%가 입문에서 멈춘다.
//
// 한 문항 삐끗하면 낮게 나오는 건 의도한 것이다. 이 값은 확정이 아니라 추천이고, 다음 화면에서
// 사용자가 직접 다른 레벨을 고를 수 있다. 낮게 추천하면 사용자가 올리면 되지만, 높게 추천해
// 첫 학습부터 막히면 그냥 이탈한다.
function calcRecommendedStep(questions: LevelTestQuestion[], answers: number[]): number {
  let step = 1;

  for (const [index, question] of questions.entries()) {
    if (answers[index] !== question.correctIndex) break;
    step = question.step;
  }

  return step;
}

export function LevelTestScreen() {
  const router = useRouter();
  const { data: questions, isPending, isError, error, refetch } = useLevelTestQuestions();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const playSelect = useSound(AVATAR_SELECT_SOUND, AVATAR_SFX_VOLUME);

  if (isPending) return <OnboardingLoading />;

  if (isError || !questions || questions.length === 0) {
    return <OnboardingError error={error ?? new Error('문제 없음')} reset={() => void refetch()} />;
  }

  const question = questions[index];
  const selected = answers[index];
  const isLast = index === questions.length - 1;
  // 문항 수 무관 진행률(%) — 동적 값이라 인라인 스타일로 처리
  const progressPercent = ((index + 1) / questions.length) * 100;

  const handleSelect = (optionIndex: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = optionIndex;
      return next;
    });
    playSelect();
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
      const step = calcRecommendedStep(questions, answers);
      router.push(`${ROUTES.LEVEL_TEST_RESULT}?step=${step}`);
      return;
    }
    setIndex((prev) => prev + 1);
  };

  return (
    <div className="bg-sand flex min-h-dvh w-full flex-col items-center pb-[env(safe-area-inset-bottom)]">
      <Header title="레벨 테스트" leftType="back" onLeftPress={handleBack} />
      <div className="flex w-full max-w-[430px] flex-1 flex-col px-6">
        {/* 진행바 */}
        <div className="mt-6 flex flex-col items-center gap-2">
          <div className="bg-coral-soft/50 h-1.5 w-full overflow-hidden rounded-full">
            {/* 진행바 폭은 문항 수에 무관한 런타임 값이라 인라인 스타일 예외 허용 (Tailwind 정적 클래스로 표현 불가) */}
            <div
              className="bg-coral h-full rounded-full transition-[width]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-coral text-xs font-bold">
            {index + 1} / {questions.length}
          </span>
        </div>

        {/* 질문 카드 */}
        <div className="mt-6 flex flex-col items-center gap-4 rounded-2xl bg-white px-6 py-8 shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
          <span className="text-coral text-sm font-bold">Q{index + 1}</span>
          <p className="text-plum text-center text-lg leading-7 font-extrabold">
            {question.prompt}
          </p>
        </div>

        {/* 선택지 — key는 보기 텍스트가 아니라 인덱스를 쓴다. DB 실데이터라 한 문항 안에서 보기
            텍스트가 겹칠 수 있고(비슷한 오답·오탈자), 그러면 key가 중복돼 선택 하이라이트가
            엉뚱한 항목에 남는다. 보기는 정렬·삽입·삭제 없이 문항이 바뀔 때 통째로 갈리므로
            인덱스 key의 통상적 위험(순서 변경 시 상태 오귀속)은 없다. */}
        <ul className="mt-6 flex flex-col gap-3">
          {question.options.map((option, optionIndex) => {
            const isActive = selected === optionIndex;
            return (
              <li key={optionIndex}>
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
