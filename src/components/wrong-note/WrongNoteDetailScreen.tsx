'use client';

import { useMemo, useState } from 'react';

import { useRouter } from 'next/navigation';

import { Header } from '@/components/common/Header';
import { Section } from '@/components/common/Section';
import { WrongNoteDetailOptionRow } from '@/components/wrong-note/WrongNoteDetailOptionRow';
import { WrongNoteExplanationCard } from '@/components/wrong-note/WrongNoteExplanationCard';
import { WrongNoteProgressBar } from '@/components/wrong-note/WrongNoteProgressBar';
import { WrongNoteResultToast } from '@/components/wrong-note/WrongNoteResultToast';
import { WrongNoteSubjectTags } from '@/components/wrong-note/WrongNoteSubjectTags';
import { useWrongNoteStore } from '@/stores/wrong-note-store';
import type { OptionState, WrongNoteItem } from '@/types/wrong-note';

interface WrongNoteDetailScreenProps {
  item: WrongNoteItem;
  isBatchMode: boolean;
  current: number;
  total: number;
  nextHref: string;
  isLastInQueue: boolean;
}

export function WrongNoteDetailScreen({
  item,
  isBatchMode,
  current,
  total,
  nextHref,
  isLastInQueue,
}: WrongNoteDetailScreenProps) {
  const router = useRouter();
  const markReviewed = useWrongNoteStore((state) => state.markReviewed);
  // 정답을 맞힐 때까지 재선택할 수 있으며, 마지막에 고른 오답 하나만 기록한다.
  const [wrongNumber, setWrongNumber] = useState<number | null>(null);
  const [isSolved, setIsSolved] = useState(false);

  const correctNumber = useMemo(
    () => item.options.find((option) => option.state === 'correct')?.number,
    [item.options],
  );
  const hasWrongAttempt = wrongNumber !== null;

  const handleSelect = (number: number) => {
    if (isSolved || number === wrongNumber) return;
    if (number === correctNumber) {
      setIsSolved(true);
      markReviewed(item.id);
    } else {
      setWrongNumber(number);
    }
  };

  // 정답을 맞히기 전에는 정답을 공개하지 않고, 마지막에 고른 오답만 표시한다.
  const displayOptions = item.options.map((option) => {
    let state: OptionState = 'neutral';
    if (isSolved && option.number === correctNumber) state = 'correct';
    else if (!isSolved && option.number === wrongNumber) state = 'my_wrong';
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
          <WrongNoteSubjectTags subject={item.subject} topic={item.topic} />
          <p className="text-brown-ink text-[15px] leading-[22px] font-bold">{item.question}</p>
        </Section>

        <div className="mt-6 flex flex-col gap-2">
          {displayOptions.map((option) => (
            <WrongNoteDetailOptionRow
              key={option.number}
              option={option}
              disabled={isSolved || option.state === 'my_wrong'}
              onSelect={() => handleSelect(option.number)}
            />
          ))}
        </div>

        {isSolved && (
          <div className="mt-8">
            <WrongNoteExplanationCard options={item.options} explanation={item.explanation} />
          </div>
        )}
        {(isSolved || hasWrongAttempt) && (
          <WrongNoteResultToast
            key={isSolved ? 'solved' : `wrong-${wrongNumber}`}
            isCorrect={isSolved}
            nextLabel={
              isSolved ? (isLastInQueue ? '오답 노트로 돌아가기' : '다음 문제') : undefined
            }
            onNext={isSolved ? () => router.push(nextHref) : undefined}
          />
        )}
      </main>
    </>
  );
}
