import { Zap } from 'lucide-react';

interface QuizXpBadgeProps {
  xp: number;
}

export function QuizXpBadge({ xp }: QuizXpBadgeProps) {
  return (
    <div className="border-coral flex w-fit items-center gap-1.5 rounded-full border bg-white px-4 py-2">
      <Zap size={18} className="fill-gold text-gold" />
      <span className="text-coral-dark text-sm font-bold">+{xp} XP 획득</span>
    </div>
  );
}
