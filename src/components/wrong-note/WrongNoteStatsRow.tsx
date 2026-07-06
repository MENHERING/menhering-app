import { cn } from '@/lib/cn';
import type { WrongNoteStats } from '@/types/wrong-note';

interface WrongNoteStatsRowProps {
  stats: WrongNoteStats;
}

interface StatBoxProps {
  value: number;
  label: string;
  highlight?: boolean;
}

function StatBox({ value, label, highlight = false }: StatBoxProps) {
  return (
    <div className="shadow-card flex flex-col items-center rounded-2xl bg-white py-3">
      <span
        className={cn(
          'text-xl leading-7 font-bold',
          highlight ? 'text-coral-accent' : 'text-brown-ink',
        )}
      >
        {value}
      </span>
      <span className="text-brown-muted mt-0.5 text-[10px] leading-[15px]">{label}</span>
    </div>
  );
}

export function WrongNoteStatsRow({ stats }: WrongNoteStatsRowProps) {
  return (
    <div className="grid grid-cols-3 gap-2 px-4 py-3">
      <StatBox value={stats.total} label="전체 오답" highlight />
      <StatBox value={stats.unreviewed} label="미복습" />
      <StatBox value={stats.reviewed} label="복습 완료" />
    </div>
  );
}
