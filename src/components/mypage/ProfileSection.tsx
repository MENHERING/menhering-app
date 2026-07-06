import { Angry, BatteryLow, FlameIcon, Frown, Meh, Smile, type LucideIcon } from 'lucide-react';
import Image from 'next/image';

import { cn } from '@/lib/cn';
import type { Mood, Profile } from '@/types/mypage/model';

interface ProfileSectionProps {
  profile: Profile;
}

const MOOD_STYLE: Record<Mood, { Icon: LucideIcon; badge: string }> = {
  행복: { Icon: Smile, badge: 'bg-yellow-soft text-brown-ink' },
  보통: { Icon: Meh, badge: 'bg-sand text-brown-ink' },
  우울: { Icon: Frown, badge: 'bg-blue-soft text-brown-ink' },
  지침: { Icon: BatteryLow, badge: 'bg-purple-soft text-brown-ink' },
  화남: { Icon: Angry, badge: 'bg-red-soft text-brown-ink' },
};

export function ProfileSection({ profile }: ProfileSectionProps) {
  const progressPercent = Math.min(100, Math.round((profile.currentXp / profile.targetXp) * 100));
  const { Icon: MoodIcon, badge: moodBadgeClassName } = MOOD_STYLE[profile.mood];

  return (
    <section className="flex flex-col items-center gap-2 px-5 pb-4">
      <div className="relative">
        <div className="from-green-accent to-coral-accent rounded-full bg-linear-to-br p-[3px]">
          <div className="relative size-[90px] overflow-hidden rounded-full bg-white">
            <Image
              src={profile.avatarUrl}
              alt={`${profile.name} 아바타`}
              fill
              className="object-contain"
              sizes="90px"
            />
          </div>
        </div>
        <span className="bg-coral absolute right-0 bottom-0 rounded-full px-2 py-0.5 text-[10px] leading-[15px] font-bold text-white">
          Lv.{profile.level}
        </span>
      </div>

      <h2 className="text-brown-ink pt-1 text-lg leading-7 font-bold">{profile.name}</h2>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="text-brown-muted rounded-full bg-white px-3 py-1 text-[11px] leading-[16.5px] font-semibold">
          {profile.difficulty} · 스테이지 {profile.stage}
        </span>
        <span
          className={cn(
            'flex items-center gap-1 rounded-full px-3 py-1 text-[11px] leading-[16.5px] font-semibold',
            moodBadgeClassName,
          )}
        >
          <MoodIcon className="size-4 shrink-0" aria-hidden />
          {profile.mood}
        </span>
      </div>

      <p className="text-brown-muted flex items-center gap-1 text-xs leading-4">
        <FlameIcon color="red" fill="red" className="size-4" aria-hidden />
        {profile.streakDays}일 연속 학습 중
      </p>

      <div className="w-full max-w-[335px] pt-1">
        <div className="text-brown-muted flex items-center justify-between text-[11px] leading-[16.5px] font-semibold">
          <span>다음 레벨까지</span>
          <span className="text-brown-ink font-bold">
            {profile.currentXp.toLocaleString()} / {profile.targetXp.toLocaleString()}
          </span>
        </div>
        <div
          className="mt-1.5 h-3 overflow-hidden rounded-full bg-white"
          role="progressbar"
          aria-valuenow={profile.currentXp}
          aria-valuemin={0}
          aria-valuemax={profile.targetXp}
          aria-label="다음 레벨까지 경험치"
        >
          <div
            className="bg-coral h-full rounded-full transition-[width]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </section>
  );
}
