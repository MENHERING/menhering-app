interface WrongNoteProgressBarProps {
  current: number;
  total: number;
}

export function WrongNoteProgressBar({ current, total }: WrongNoteProgressBarProps) {
  const percent = total > 0 ? Math.min(100, (current / total) * 100) : 0;

  return (
    <div className="flex items-center gap-2.5 px-4 pt-4 pb-5">
      <div
        className="bg-cream h-1.5 flex-1 overflow-hidden rounded-full"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label="오답 노트 다시 풀기 진행률"
      >
        <div
          className="bg-coral-accent h-full rounded-full transition-[width]"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-coral-accent shrink-0 text-[11px] leading-[16.5px] font-bold">
        {current} / {total}
      </span>
    </div>
  );
}
