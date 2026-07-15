import { Check, X } from 'lucide-react';

import { cn } from '@/lib/cn';
import type { OptionState } from '@/schemas/wrong-note.schema';

interface WrongNoteAnswerMarkProps {
  state: OptionState;
}

// 보기 상태에 따른 '내 답'(오답) / '정답' 마커. neutral이면 렌더링하지 않는다.
export function WrongNoteAnswerMark({ state }: WrongNoteAnswerMarkProps) {
  if (state === 'neutral') return null;

  const isCorrect = state === 'correct';
  const Icon = isCorrect ? Check : X;

  return (
    <span
      className={cn(
        'flex shrink-0 items-center gap-1 text-[10px] leading-none font-bold',
        isCorrect ? 'text-answer-correct' : 'text-answer-wrong',
      )}
    >
      <Icon className="size-3" strokeWidth={3} aria-hidden />
      {isCorrect ? '정답' : '내 답'}
    </span>
  );
}
