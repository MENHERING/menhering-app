import { cn } from '@/lib/cn';

// selected: 정답/오답 여부와 무관하게 "이걸 선택했다"만 중립적인 연한 회색으로 표시.
type QuizOptionState = 'default' | 'selected';

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
        state === 'selected' && 'border-locked bg-locked/15',
      )}
    >
      <span
        className={cn(
          'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
          state === 'default' && 'bg-coral-soft/50 text-coral',
          state === 'selected' && 'bg-locked text-brown-muted',
        )}
      >
        {index + 1}
      </span>

      <span className="text-ink flex-1 text-sm font-medium">{label}</span>
    </button>
  );
}
