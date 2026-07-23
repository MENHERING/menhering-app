interface QuizResultStatsProps {
  correctCount: number;
  wrongCount: number;
}

export function QuizResultStats({ correctCount, wrongCount }: QuizResultStatsProps) {
  return (
    <div className="divide-cream mx-5 flex divide-x rounded-2xl bg-white shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
      <div className="flex flex-1 flex-col items-center gap-1 py-4">
        <span className="text-correct text-2xl font-extrabold">{correctCount}</span>
        <span className="text-brown-soft text-xs font-semibold">정답</span>
      </div>
      <div className="flex flex-1 flex-col items-center gap-1 py-4">
        <span className="text-wrong text-2xl font-extrabold">{wrongCount}</span>
        <span className="text-brown-soft text-xs font-semibold">오답</span>
      </div>
    </div>
  );
}
