import { cn } from '@/lib/cn';
import type { WrongNoteFilter, WrongNoteStats, WrongNoteSubject } from '@/types/wrong-note';

interface FilterOption {
  value: WrongNoteFilter;
  label: string;
}

interface WrongNoteFilterBarProps {
  activeFilter: WrongNoteFilter;
  onChange: (filter: WrongNoteFilter) => void;
  stats: WrongNoteStats;
  subjects: WrongNoteSubject[];
}

export function WrongNoteFilterBar({
  activeFilter,
  onChange,
  stats,
  subjects,
}: WrongNoteFilterBarProps) {
  const options: FilterOption[] = [
    { value: 'all', label: `전체 ${stats.total}` },
    { value: 'unreviewed', label: `미복습 ${stats.unreviewed}` },
    { value: 'reviewed', label: `복습 완료 ${stats.reviewed}` },
    ...subjects.map((s) => ({ value: s, label: s })),
  ];

  return (
    <div className="px-4">
      <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
        {options.map((opt) => {
          const isActive = activeFilter === opt.value;

          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={cn(
                'shrink-0 rounded-full px-3 py-1.5 text-xs leading-4 font-semibold transition-colors',
                isActive ? 'bg-coral-accent text-white' : 'text-brown-muted bg-white',
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      <div className="bg-coral-accent/15 h-px" />
    </div>
  );
}
