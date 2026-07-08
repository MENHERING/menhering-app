import { cn } from '@/lib/cn';

type QuizOptionState = 'default' | 'correct' | 'wrong-selected';

interface QuizOptionButtonProps {
  index: number;
  label: string;
  state: QuizOptionState;
  disabled: boolean;
  onSelect: () => void;
}

export function QuizOptionButton({
  index,
  label,
  state,
  disabled,
  onSelect,
}: QuizOptionButtonProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={cn(
        'flex w-full items-center gap-3 rounded-2xl border-2 bg-white px-4 py-3.5 text-left shadow-[0_4px_12px_rgba(0,0,0,0.06)] disabled:cursor-not-allowed',
        state === 'default' && 'border-transparent',
        state === 'correct' && 'border-correct bg-correct/10',
        state === 'wrong-selected' && 'border-wrong bg-wrong/10',
      )}
    >
      <span
        className={cn(
          'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
          state === 'default' && 'bg-coral-soft/50 text-coral',
          state === 'correct' && 'bg-correct text-white',
          state === 'wrong-selected' && 'bg-wrong text-white',
        )}
      >
        {index + 1}
      </span>

      <span className="text-ink flex-1 text-sm font-medium">{label}</span>

      {state === 'correct' && (
        <span className="bg-correct w-fit shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold text-white">
          정답
        </span>
      )}
      {state === 'wrong-selected' && (
        <span className="bg-wrong w-fit shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold text-white">
          내 답
        </span>
      )}
    </button>
  );
}
