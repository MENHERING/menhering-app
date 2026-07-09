import { WrongNoteAnswerMark } from '@/components/wrong-note/WrongNoteAnswerMark';
import { OPTION_SYMBOLS } from '@/constants/wrong-note';
import { cn } from '@/lib/cn';
import type { OptionState, WrongNoteOption } from '@/types/wrong-note';

const OPTION_ROW_BG: Record<OptionState, string> = {
  my_wrong: 'bg-answer-wrong-soft',
  correct: 'bg-answer-correct-soft',
  neutral: 'bg-answer-neutral-soft',
};

const OPTION_TEXT: Record<OptionState, string> = {
  my_wrong: 'text-answer-wrong',
  correct: 'text-answer-correct',
  neutral: 'text-answer-neutral',
};

interface WrongNoteOptionRowProps {
  option: WrongNoteOption;
}

export function WrongNoteOptionRow({ option }: WrongNoteOptionRowProps) {
  return (
    <div
      className={cn('flex items-center gap-2 rounded-2xl px-3 py-2.5', OPTION_ROW_BG[option.state])}
    >
      <span className="text-brown-muted flex size-5 shrink-0 items-center justify-center rounded-full bg-white/70 text-[10px] leading-none font-bold">
        {OPTION_SYMBOLS[option.number - 1]}
      </span>
      <span
        className={cn('min-w-0 flex-1 text-xs leading-4 font-semibold', OPTION_TEXT[option.state])}
      >
        {option.text}
      </span>
      <WrongNoteAnswerMark state={option.state} />
    </div>
  );
}
