import { AlertCircle } from 'lucide-react';

interface QuizExplanationProps {
  explanation: string;
  onNext: () => void;
}

export function QuizExplanation({ explanation, onNext }: QuizExplanationProps) {
  return (
    <button
      type="button"
      onClick={onNext}
      aria-label="다음 문제로 이동"
      className="bg-gold/15 mx-5 flex flex-col gap-2 rounded-2xl p-4 text-left"
    >
      <div className="flex items-center gap-1.5">
        <AlertCircle size={18} className="text-gold" />
        <span className="text-ink text-sm font-bold">해설</span>
      </div>

      <p className="text-ink/80 text-sm leading-6">{explanation}</p>

      <span className="text-brown-soft mt-1 text-right text-xs font-semibold">
        탭해서 다음 문제로 &gt;
      </span>
    </button>
  );
}
