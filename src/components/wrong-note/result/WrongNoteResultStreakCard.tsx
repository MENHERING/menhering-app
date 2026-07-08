interface WrongNoteResultStreakCardProps {
  streakDays: number;
}

export function WrongNoteResultStreakCard({ streakDays }: WrongNoteResultStreakCardProps) {
  return (
    <div className="shadow-card flex w-full items-center justify-center gap-2 rounded-2xl bg-white p-4">
      <span className="text-lg leading-7">🔥</span>
      <p className="text-coral-accent text-sm leading-5 font-bold">
        {streakDays}일 연속 학습 달성!
      </p>
    </div>
  );
}
