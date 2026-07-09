import { Star } from 'lucide-react';

interface QuizXpBadgeProps {
  xp: number;
}

export function QuizXpBadge({ xp }: QuizXpBadgeProps) {
  return (
    <div className="bg-coral-soft mx-auto flex w-fit items-center gap-1.5 rounded-full px-4 py-2">
      <Star size={18} className="fill-gold text-gold" />
      <span className="text-coral-dark text-sm font-bold">+{xp} XP 획득</span>
    </div>
  );
}
