import { Lock } from 'lucide-react';

import { cn } from '@/lib/cn';
import { isCurriculumLocked } from '@/lib/curriculum-lock';
import type { Curriculum } from '@/types/lesson';

interface CurriculumDropdownProps {
  curricula: Curriculum[];
  myStep: number;
  selectedId: string;
  onSelect: (curriculumId: string) => void;
}

export function CurriculumDropdown({
  curricula,
  myStep,
  selectedId,
  onSelect,
}: CurriculumDropdownProps) {
  return (
    <ul className="mx-5 mt-2 flex flex-col gap-2 rounded-2xl bg-white p-2 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
      {curricula.map((curriculum) => {
        const isLocked = isCurriculumLocked(curriculum.step, myStep);
        const isSelected = curriculum.id === selectedId;

        return (
          <li key={curriculum.id}>
            <button
              type="button"
              disabled={isLocked}
              onClick={() => onSelect(curriculum.id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors disabled:cursor-not-allowed',
                isSelected && 'bg-coral-soft/40',
                !isLocked && !isSelected && 'hover:bg-sand',
              )}
            >
              <span
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white',
                  isLocked ? 'bg-locked text-locked-icon' : 'bg-primary',
                )}
              >
                {curriculum.step}
              </span>
              <span className="flex flex-1 flex-col">
                <span
                  className={cn('text-sm font-bold', isLocked ? 'text-brown-muted' : 'text-ink')}
                >
                  {curriculum.level}
                </span>
                <span className="text-brown-muted text-xs font-medium">{curriculum.title}</span>
              </span>
              {isLocked ? (
                <Lock size={18} className="text-locked-icon" aria-label="잠김" />
              ) : (
                <span className="text-brown-muted text-xs font-semibold">
                  {curriculum.clearedCount}/{curriculum.totalCount}
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
