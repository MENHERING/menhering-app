import { ChevronDown, Trophy } from 'lucide-react';

import { cn } from '@/lib/cn';

interface CurriculumBarProps {
  level: string;
  title: string;
  clearedCount: number;
  totalCount: number;
  isDropdownOpen: boolean;
  onTogglePress: () => void;
  onRankingPress?: () => void;
}

export function CurriculumBar({
  level,
  title,
  clearedCount,
  totalCount,
  isDropdownOpen,
  onTogglePress,
  onRankingPress,
}: CurriculumBarProps) {
  return (
    <div className="flex items-stretch gap-2 px-5">
      <button
        type="button"
        onClick={onTogglePress}
        aria-expanded={isDropdownOpen}
        className="bg-coral flex flex-1 flex-col items-start gap-0.5 rounded-2xl px-4 py-2.5 text-left text-white shadow-[0_3px_10px_rgba(0,0,0,0.12)]"
      >
        <span className="text-xs font-medium text-white/90">
          {level} · {clearedCount}/{totalCount} 클리어
        </span>
        <span className="flex w-full items-center justify-between text-base font-bold">
          {title}
          <ChevronDown
            size={18}
            className={cn('transition-transform', isDropdownOpen && 'rotate-180')}
          />
        </span>
      </button>

      <button
        type="button"
        onClick={onRankingPress}
        aria-label="랭킹"
        className="bg-coral flex w-[52px] shrink-0 items-center justify-center rounded-2xl text-white shadow-[0_3px_10px_rgba(0,0,0,0.12)]"
      >
        <Trophy size={20} />
      </button>
    </div>
  );
}
