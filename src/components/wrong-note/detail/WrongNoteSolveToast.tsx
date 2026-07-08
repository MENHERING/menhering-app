import { ArrowRight, Frown, PartyPopper } from 'lucide-react';

import { Button } from '@/components/common/Button';
import { cn } from '@/lib/cn';

interface WrongNoteResultToastProps {
  isCorrect: boolean;
  nextLabel?: string;
  onNext?: () => void;
}

export function WrongNoteResultToast({ isCorrect, nextLabel, onNext }: WrongNoteResultToastProps) {
  const Icon = isCorrect ? PartyPopper : Frown;

  return (
    <div
      className={cn(
        'animate-rise-in sticky bottom-4 mt-6 flex flex-col gap-3.5 rounded-[20px] p-4 text-white',
        isCorrect
          ? 'bg-answer-correct shadow-[0_10px_24px_rgba(76,175,80,0.4)]'
          : 'bg-coral-accent shadow-[0_10px_24px_rgba(232,114,90,0.45)]',
      )}
    >
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/20">
          <Icon className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-base leading-[22px] font-bold">
            {isCorrect ? '정답입니다!' : '틀렸어요'}
          </p>
          <p className="text-[11px] leading-4 text-white/75">
            {isCorrect ? '해설을 확인해 보세요' : '다시 선택해 보세요'}
          </p>
        </div>
      </div>
      {nextLabel && onNext && (
        <Button
          size="md"
          isFullWidth
          onClick={onNext}
          rightIcon={<ArrowRight className="size-4" strokeWidth={3} aria-hidden />}
          className={cn(
            'gap-1.5 bg-white shadow-none transition-transform active:scale-[0.98]',
            isCorrect ? 'text-answer-correct' : 'text-coral-accent',
          )}
        >
          {nextLabel}
        </Button>
      )}
    </div>
  );
}
