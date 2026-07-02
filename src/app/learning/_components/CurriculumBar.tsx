import { BarChart3, ChevronDown } from 'lucide-react';

interface CurriculumBarProps {
  level: string;
  title: string;
  clearedCount: number;
  totalCount: number;
  onStatsPress?: () => void;
}

export function CurriculumBar({
  level,
  title,
  clearedCount,
  totalCount,
  onStatsPress,
}: CurriculumBarProps) {
  return (
    <div className="flex items-center gap-2 px-5">
      <button
        type="button"
        className="bg-coral flex flex-1 flex-col items-start gap-0.5 rounded-2xl px-4 py-2.5 text-left text-white shadow-[0_3px_10px_rgba(0,0,0,0.12)]"
      >
        <span className="text-xs font-medium text-white/90">
          {level} · {clearedCount}/{totalCount} 클리어
        </span>
        <span className="flex w-full items-center justify-between text-base font-bold">
          {title}
          <ChevronDown size={18} />
        </span>
      </button>

      <button
        type="button"
        onClick={onStatsPress}
        aria-label="학습 통계"
        className="bg-coral flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl text-white shadow-[0_3px_10px_rgba(0,0,0,0.12)]"
      >
        <BarChart3 size={20} />
      </button>
    </div>
  );
}
