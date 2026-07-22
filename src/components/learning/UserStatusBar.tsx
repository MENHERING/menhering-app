import { Zap } from 'lucide-react';
import Image from 'next/image';

interface UserStatusBarProps {
  nickname: string;
  level: number;
  currentXp: number;
  targetXp: number;
}

export function UserStatusBar({ nickname, level, currentXp, targetXp }: UserStatusBarProps) {
  return (
    <div className="flex items-center justify-between px-5 py-6">
      <div className="flex items-center gap-3">
        <Image
          src="/images/avatar/menhering_1_img.webp"
          alt="아바타"
          width={56}
          height={56}
          className="rounded-full border-2 border-white"
        />
        <div className="flex flex-col">
          <span className="text-ink text-base font-bold">{nickname}</span>
          <span className="text-brown-soft text-sm font-semibold">Level {level}</span>
        </div>
      </div>

      <div className="border-coral inline-flex items-center gap-1.5 rounded-full border bg-white px-3.5 py-1.5">
        <Zap size={16} className="fill-gold text-gold" aria-hidden />
        <span className="text-coral-dark text-sm font-bold">
          {currentXp.toLocaleString()} / {targetXp.toLocaleString()} XP
        </span>
      </div>
    </div>
  );
}
