import { Check } from 'lucide-react';

import { WrongNoteOptionRow } from '@/components/wrong-note/WrongNoteOptionRow';
import { cn } from '@/lib/cn';
import type { WrongNoteItem, WrongNoteSubject } from '@/types/wrong-note';

const SUBJECT_STYLE: Partial<Record<WrongNoteSubject, { bg: string; text: string }>> = {
  HTML: { bg: 'bg-subject-html-surface', text: 'text-subject-html' },
  CSS: { bg: 'bg-subject-css-surface', text: 'text-subject-css' },
  JS: { bg: 'bg-subject-js-surface', text: 'text-subject-js' },
  React: { bg: 'bg-subject-react-surface', text: 'text-subject-react' },
};

const DEFAULT_SUBJECT_STYLE = { bg: 'bg-note-gray-soft', text: 'text-answer-neutral' };

interface WrongNoteCardProps {
  item: WrongNoteItem;
}

export function WrongNoteCard({ item }: WrongNoteCardProps) {
  const { bg: subjectBg, text: subjectText } = SUBJECT_STYLE[item.subject] ?? DEFAULT_SUBJECT_STYLE;
  const isReviewed = item.reviewStatus === 'reviewed';

  return (
    <div className="shadow-card rounded-2xl bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-[10px] leading-[15px] font-bold',
              subjectBg,
              subjectText,
            )}
          >
            {item.subject}
          </span>
          <span className="bg-note-gray-soft text-answer-neutral rounded-full px-2 py-0.5 text-[10px] leading-[15px] font-bold">
            {item.topic}
          </span>
        </div>
        <span className="text-brown-muted text-[10px] leading-[15px]">{item.daysAgo}</span>
      </div>

      <p className="text-brown-ink mt-2.5 text-sm leading-5.5 font-bold">{item.question}</p>

      <div className="mt-3 flex flex-col gap-2">
        {item.options.map((option) => (
          <WrongNoteOptionRow key={option.number} option={option} />
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span
          className={cn(
            'flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] leading-4.5 font-bold',
            isReviewed
              ? 'bg-answer-correct-soft text-answer-correct'
              : 'bg-coral-tint text-coral-accent',
          )}
        >
          {isReviewed && <Check className="size-3" strokeWidth={3} aria-hidden />}
          {isReviewed ? '복습 완료' : '미복습'}
        </span>
        {!isReviewed && (
          <button
            type="button"
            className="bg-coral-accent rounded-full px-4 py-1 text-[11px] leading-5.5 font-bold text-white"
          >
            다시 풀기
          </button>
        )}
      </div>
    </div>
  );
}
