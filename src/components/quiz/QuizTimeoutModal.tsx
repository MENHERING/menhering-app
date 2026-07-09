import { Clock, X } from 'lucide-react';

import { Button } from '@/components/common/Button';
import { QuizAvatarRing } from '@/components/quiz/QuizAvatarRing';

interface QuizTimeoutModalProps {
  onRetry: () => void;
  onLeave: () => void;
}

export function QuizTimeoutModal({ onRetry, onLeave }: QuizTimeoutModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quiz-timeout-title"
      onClick={onLeave}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="relative flex w-full max-w-[350px] flex-col items-center gap-4 rounded-3xl bg-white p-6 text-center"
      >
        <button
          type="button"
          onClick={onLeave}
          aria-label="닫기"
          className="text-brown-soft absolute top-4 right-4"
        >
          <X size={20} />
        </button>

        <QuizAvatarRing
          size={112}
          happinessPercent={20}
          badge={
            <span className="bg-coral flex size-8 items-center justify-center rounded-full">
              <Clock size={16} className="text-white" />
            </span>
          }
        />

        <div>
          <p
            id="quiz-timeout-title"
            className="text-ink flex items-center justify-center gap-1.5 text-lg font-bold"
          >
            <Clock size={18} className="text-coral" />
            시간 초과
          </p>
          <p className="text-brown-soft mt-1 text-sm leading-6">
            문제를 다시 풀어볼까요?
            <br />
            진행 상황은 저장되지 않아요
          </p>
        </div>

        <Button variant="primary" size="lg" isFullWidth onClick={onRetry}>
          다시 도전하기
        </Button>

        <button type="button" onClick={onLeave} className="text-brown-soft text-sm font-semibold">
          스테이지 나가기
        </button>
      </div>
    </div>
  );
}
