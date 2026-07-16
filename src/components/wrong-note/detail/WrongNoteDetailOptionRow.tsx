import { WrongNoteAnswerMark } from '@/components/wrong-note/WrongNoteAnswerMark';
import { OPTION_SYMBOLS } from '@/constants/wrong-note';
import { cn } from '@/lib/cn';
import type { OptionState } from '@/schemas/wrong-note.schema';
import type { WrongNoteOption } from '@/types/wrong-note';

const STATE_STYLE: Record<
  OptionState,
  { row: string; border: string; text: string; badge: string }
> = {
  my_wrong: {
    row: 'bg-answer-wrong-soft',
    border: 'border-answer-wrong',
    text: 'text-answer-wrong',
    badge: 'bg-answer-wrong-badge text-answer-wrong',
  },
  correct: {
    row: 'bg-answer-correct-soft',
    border: 'border-answer-correct',
    text: 'text-answer-correct',
    badge: 'bg-answer-correct-badge text-answer-correct',
  },
  neutral: {
    row: 'bg-white',
    border: 'border-answer-neutral-border',
    text: 'text-answer-neutral',
    badge: 'bg-note-gray-soft text-answer-neutral',
  },
};

interface WrongNoteDetailOptionRowProps {
  option: WrongNoteOption;
  disabled: boolean;
  onSelect: () => void;
}

export function WrongNoteDetailOptionRow({
  option,
  disabled,
  onSelect,
}: WrongNoteDetailOptionRowProps) {
  const style = STATE_STYLE[option.state];

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={cn(
        'flex w-full items-center gap-3 rounded-[14px] border px-[17px] py-3 text-left transition-colors disabled:cursor-default',
        style.row,
        style.border,
      )}
    >
      <span
        className={cn(
          'text-4 flex size-6 shrink-0 items-center justify-center rounded-full leading-none font-medium',
          style.badge,
        )}
      >
        {OPTION_SYMBOLS[option.number - 1]}
      </span>
      <span className={cn('min-w-0 flex-1 text-xs leading-[16.5px] font-semibold', style.text)}>
        {option.text}
      </span>
      <WrongNoteAnswerMark state={option.state} />
    </button>
  );
}
