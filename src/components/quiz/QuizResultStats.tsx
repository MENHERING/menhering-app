interface QuizResultStatsProps {
  correctCount: number;
  wrongCount: number;
}

export function QuizResultStats({ correctCount, wrongCount }: QuizResultStatsProps) {
  return (
    <div className="mx-5 flex gap-3">
      <div className="flex flex-1 flex-col items-center gap-1 rounded-2xl bg-white py-4 shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
        <span className="text-correct text-2xl font-extrabold">{correctCount}</span>
        <span className="text-brown-soft text-xs font-semibold">정답</span>
      </div>
      <div className="flex flex-1 flex-col items-center gap-1 rounded-2xl bg-white py-4 shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
        <span className="text-wrong text-2xl font-extrabold">{wrongCount}</span>
        <span className="text-brown-soft text-xs font-semibold">오답</span>
      </div>
    </div>
  );
}
