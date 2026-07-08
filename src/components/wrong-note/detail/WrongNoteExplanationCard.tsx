import { OPTION_SYMBOLS } from '@/constants/wrong-note';
import type { WrongNoteOption } from '@/types/wrong-note';

interface WrongNoteExplanationCardProps {
  options: WrongNoteOption[];
  explanation: string;
}

export function WrongNoteExplanationCard({ options, explanation }: WrongNoteExplanationCardProps) {
  const correctOption = options.find((option) => option.state === 'correct');

  return (
    <div className="overflow-hidden rounded-[20px] bg-[linear-gradient(160deg,var(--explain-surface-start),var(--explain-surface-end))]">
      <div className="border-answer-correct/15 flex items-center gap-2.5 border-b px-[18px] pt-[18px] pb-[15px]">
        <span className="bg-answer-correct flex size-[30px] shrink-0 items-center justify-center rounded-full text-[15px] font-bold text-white shadow-[0_2px_3px_rgba(76,175,80,0.35)]">
          !
        </span>
        <div>
          <p className="text-explain-title text-sm leading-5 font-bold">해설</p>
          {correctOption && (
            <p className="text-explain-subtitle text-[10px] leading-[14px]">
              정답: {OPTION_SYMBOLS[correctOption.number - 1]} {correctOption.text}
            </p>
          )}
        </div>
      </div>
      <p className="text-explain-body px-[18px] pt-3.5 pb-[18px] text-[13px] leading-[21px]">
        {explanation}
      </p>
    </div>
  );
}
