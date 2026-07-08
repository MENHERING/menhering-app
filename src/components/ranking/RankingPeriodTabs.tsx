import { cn } from '@/lib/cn';
import type { RankingPeriod } from '@/types/ranking/model';

const PERIODS: { value: RankingPeriod; label: string }[] = [
  { value: 'week', label: '주간' },
  { value: 'all', label: '전체' },
];

interface RankingPeriodTabsProps {
  selected: RankingPeriod;
  onSelect: (period: RankingPeriod) => void;
}

export function RankingPeriodTabs({ selected, onSelect }: RankingPeriodTabsProps) {
  return (
    <div className="mx-5 flex gap-1 rounded-2xl bg-white p-1 shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
      {PERIODS.map(({ value, label }) => {
        const active = value === selected;

        return (
          <button
            key={value}
            type="button"
            onClick={() => onSelect(value)}
            aria-pressed={active}
            className={cn(
              'flex-1 rounded-xl py-2 text-sm font-bold transition-colors',
              active ? 'bg-coral text-white' : 'text-brown-soft bg-transparent',
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
