import { Check, Lock } from 'lucide-react';
import Image from 'next/image';

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
        'relative flex h-20 w-20 items-center justify-center rounded-full transition-transform disabled:cursor-not-allowed',
        status === 'completed' && 'bg-coral shadow-[0_4px_10px_rgba(0,0,0,0.15)]',
        status === 'current' &&
          'ring-coral text-coral bg-white text-3xl font-extrabold shadow-[0_4px_10px_rgba(0,0,0,0.15)] ring-4',
        status === 'locked' && 'bg-gray-300',
        isSelected && 'scale-105',
      )}
    >
      {status === 'completed' && <Check size={32} className="text-white" strokeWidth={3} />}
      {status === 'current' && (
        <>
          {order}
          <Image
            src="/images/avatar/panda.png"
            alt=""
            width={96}
            height={96}
            className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2"
          />
        </>
      )}
      {status === 'locked' && <Lock size={28} className="text-gray-500" />}
    </button>
  );
}
