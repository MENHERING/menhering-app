import { Check, Lock, Star } from 'lucide-react';

import { cn } from '@/lib/cn';
import type { LessonStatus } from '@/types/lesson';

interface LessonNodeProps {
  order: number;
  status: LessonStatus;
  isSelected?: boolean;
  onPress?: () => void;
}

export function LessonNode({ order, status, isSelected = false, onPress }: LessonNodeProps) {
  const isInteractive = status !== 'locked';

  return (
    <button
      type="button"
      disabled={!isInteractive}
      onClick={onPress}
      aria-label={`레슨 ${order}`}
      className={cn(
        'relative flex h-16 w-16 items-center justify-center rounded-full transition-transform disabled:cursor-not-allowed',
        status === 'completed' && 'bg-coral shadow-[0_4px_10px_rgba(0,0,0,0.15)]',
        status === 'current' &&
          'ring-coral text-coral bg-white text-2xl font-extrabold shadow-[0_4px_10px_rgba(0,0,0,0.15)] ring-4',
        status === 'locked' && 'bg-gray-300',
        isSelected && 'scale-105',
      )}
    >
      {status === 'completed' && (
        <>
          <Check size={28} className="text-white" strokeWidth={3} />
          <Star size={16} className="absolute -top-1 -right-1 fill-amber-400 text-amber-400" />
        </>
      )}
      {status === 'current' && order}
      {status === 'locked' && <Lock size={24} className="text-gray-500" />}
    </button>
  );
}
