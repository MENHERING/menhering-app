interface QuizQuestionCardProps {
  order: number;
  prompt: string;
}

export function QuizQuestionCard({ order, prompt }: QuizQuestionCardProps) {
  return (
    <div className="mx-5 flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
      <span className="bg-coral-soft text-coral w-fit rounded-full px-3 py-1 text-xs font-bold">
        문제{order}
      </span>
      <p className="text-ink text-lg leading-snug font-bold">{prompt}</p>
    </div>
  );
}
