'use client';

import { useMemo, useState } from 'react';

import { notFound, useRouter } from 'next/navigation';

import { Header } from '@/components/common/Header';
import { Section } from '@/components/common/Section';
import { Toast } from '@/components/common/Toast';
import { WrongNoteDetailOptionRow } from '@/components/wrong-note/detail/WrongNoteDetailOptionRow';
import { WrongNoteExplanationCard } from '@/components/wrong-note/detail/WrongNoteExplanationCard';
import { WrongNoteProgressBar } from '@/components/wrong-note/detail/WrongNoteProgressBar';
import { WrongNoteResultToast } from '@/components/wrong-note/detail/WrongNoteSolveToast';
import { WrongNoteSubjectTags } from '@/components/wrong-note/WrongNoteSubjectTags';
import { useMarkWrongNoteReviewed } from '@/hooks/wrong-note/use-mark-wrong-note-reviewed';
import { useWrongNoteItem } from '@/hooks/wrong-note/use-wrong-note-item';
import { ApiError } from '@/lib/api-error';
import type { OptionState } from '@/schemas/wrong-note.schema';
import { useWrongNoteStore } from '@/stores/wrong-note-store';

interface WrongNoteDetailScreenProps {
  id: string;
  isBatchMode: boolean;
  current: number;
  total: number;
  nextHref: string;
  isLastInQueue: boolean;
}

export function WrongNoteDetailScreen({
  id,
  isBatchMode,
  current,
  total,
  nextHref,
  isLastInQueue,
}: WrongNoteDetailScreenProps) {
  const router = useRouter();
  const { data: item, isPending, error } = useWrongNoteItem(id);
  const { mutate: markReviewed } = useMarkWrongNoteReviewed();
  const recordSolveResult = useWrongNoteStore((state) => state.recordSolveResult);
  // 선택은 한 번만 가능하며, 정답/오답 여부와 무관하게 즉시 정답을 함께 공개한다.
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  // 복습 완료(PATCH) 실패 시 사용자에게 알려줄 에러 메시지. 성공은 캐시 무효화로 충분해 별도 표시 없음.
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const correctNumber = useMemo(
    () => item?.options.find((option) => option.state === 'correct')?.number,
    [item],
  );
  const isAnswered = selectedNumber !== null;
  const isCorrect = selectedNumber === correctNumber;

  const handleSelect = (number: number) => {
    if (isAnswered || !item) return;
    setSelectedNumber(number);
    const isFirstTryCorrect = number === correctNumber;
    // 정답을 맞혔을 때만 복습 완료로 처리하고, 틀리면 미복습 상태를 유지해 다시 풀 수 있게 한다.
    if (isFirstTryCorrect) {
      markReviewed(item.id, {
        onError: () => setErrorMessage('복습 완료 처리에 실패했어요.'),
      });
    }
    recordSolveResult(item.id, isFirstTryCorrect);
  };

  if (error instanceof ApiError && error.statusCode === 404) {
    notFound();
  }

  if (isPending || error || !item) {
    return (
      <>
        <Header
          title="오답 노트"
          leftType="none"
          rightType="close"
          onRightPress={() => router.back()}
        />
        <main className="flex-1 p-4 pb-8">
          <p className="text-brown-muted py-10 text-center text-sm">
            {error ? '오답 기록을 불러오지 못했어요.' : '불러오는 중...'}
          </p>
        </main>
      </>
    );
  }

  // 선택 즉시 정답 위치와 내가 고른 오답을 함께 보여준다.
  const displayOptions = item.options.map((option) => {
    let state: OptionState = 'neutral';
    if (isAnswered && option.number === correctNumber) state = 'correct';
    else if (isAnswered && option.number === selectedNumber) state = 'my_wrong';
    return { ...option, state };
  });

  return (
    <>
      <Header
        title="오답 노트"
        leftType="none"
        rightType="close"
        onRightPress={() => router.back()}
      />
      {isBatchMode && <WrongNoteProgressBar current={current} total={total} />}
      <main className="flex-1 p-4 pb-8">
        <Section className="shadow-card flex flex-col gap-4 p-4">
          <WrongNoteSubjectTags label={item.label} />
          <p className="text-brown-ink text-[15px] leading-[22px] font-bold">{item.question}</p>
        </Section>

        <div className="mt-6 flex flex-col gap-2">
          {displayOptions.map((option) => (
            <WrongNoteDetailOptionRow
              key={option.number}
              option={option}
              disabled={isAnswered}
              onSelect={() => handleSelect(option.number)}
            />
          ))}
        </div>

        {isAnswered && (
          <div className="mt-8">
            <WrongNoteExplanationCard options={item.options} explanation={item.explanation} />
          </div>
        )}
        {isAnswered && (
          <WrongNoteResultToast
            isCorrect={isCorrect}
            nextLabel={isLastInQueue ? '제출하기' : '다음 문제'}
            onNext={() => router.push(nextHref)}
          />
        )}
      </main>

      <Toast
        isOpen={errorMessage !== null}
        message={errorMessage ?? ''}
        variant="error"
        duration={0}
        dismissible
        onClose={() => setErrorMessage(null)}
      />
    </>
  );
}
