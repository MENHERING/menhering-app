import { Zap } from 'lucide-react';
import Image from 'next/image';

import { XP_FOR_NEXT_LEVEL } from '@/constants/home';

interface UserStatusBarProps {
  nickname: string;
  level: number;
  xp: number;
  avatarSrc: string;
}

export function UserStatusBar({ nickname, level, xp, avatarSrc }: UserStatusBarProps) {
  // xp는 누적 총합이라 그대로 보여주면 레벨 개념과 안 맞는다. 레벨업 공식이 정해지기 전까지는
  // 현재 레벨 내 진행률처럼 보이도록 XP_FOR_NEXT_LEVEL로 나눈 나머지를 임시로 보여준다.
  const currentLevelXp = xp % XP_FOR_NEXT_LEVEL;

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
        <div className="flex flex-col">
          <span className="text-ink text-base font-bold">{nickname}</span>
          <span className="text-brown-soft text-sm font-semibold">Level {level}</span>
        </div>
      </div>

      <div className="border-coral inline-flex items-center gap-1.5 rounded-full border bg-white px-3.5 py-1.5">
        <Zap size={16} className="fill-gold text-gold" aria-hidden />
        <span className="text-coral-dark text-sm font-bold">
          {currentLevelXp.toLocaleString()} / {XP_FOR_NEXT_LEVEL.toLocaleString()} XP
        </span>
      </div>
    </div>
  );
}
