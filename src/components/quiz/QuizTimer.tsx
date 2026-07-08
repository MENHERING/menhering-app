import { Clock } from 'lucide-react';

interface QuizTimerProps {
  secondsLeft: number;
  totalSeconds: number;
  currentIndex: number;
  totalQuestions: number;
}

export function QuizTimer({
  secondsLeft,
  totalSeconds,
  currentIndex,
  totalQuestions,
}: QuizTimerProps) {
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const percent = (secondsLeft / totalSeconds) * 100;

  return (
    <div className="flex items-center gap-3 px-5">
      <span className="text-coral flex items-center gap-1 text-sm font-bold tabular-nums">
        <Clock size={16} />
        {minutes}:{seconds.toString().padStart(2, '0')}
      </span>

      <div className="bg-coral-soft/50 h-1.5 flex-1 overflow-hidden rounded-full">
        {/* 런타임 계산값이라 Tailwind 정적 클래스로 표현 불가 → inline style 예외 */}
        <div
          className="bg-coral h-full rounded-full transition-[width]"
          style={{ width: `${percent}%` }}
        />
      </div>

      <span className="text-brown-soft text-xs font-bold">
        {currentIndex + 1}/{totalQuestions}
      </span>
    </div>
  );
}
