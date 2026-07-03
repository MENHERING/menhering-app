import { Star } from 'lucide-react';
import Image from 'next/image';

interface UserStatusBarProps {
  level: number;
  xp: number;
  avatarSrc: string;
}

export function UserStatusBar({ level, xp, avatarSrc }: UserStatusBarProps) {
  return (
    <div className="flex items-center justify-between px-5 py-6">
      <div className="flex items-center gap-3">
        <Image
          src={avatarSrc}
          alt="아바타"
          width={56}
          height={56}
          className="rounded-full border-2 border-white"
        />
        <span className="text-ink text-xl font-bold">Level {level}</span>
      </div>

      <div className="bg-coral-soft flex items-center gap-1.5 rounded-full px-4 py-2">
        <Star size={20} className="fill-gold text-gold" />
        <span className="text-coral-dark text-base font-bold">{xp.toLocaleString()} XP</span>
      </div>
    </div>
  );
}
