'use client';

import type { CSSProperties } from 'react';

import {
  Bell,
  ChevronRight,
  CircleCheck,
  Flame,
  PawPrint,
  Sparkles,
  Star,
  Target,
  type LucideIcon,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { CharacterRenderer } from '@/components/avatar/CharacterRenderer';
import { Button } from '@/components/common/Button';
import { Footer } from '@/components/common/Footer';
import { Section } from '@/components/common/Section';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/cn';
import type { CharacterType, ColorTheme } from '@/types/avatar';
import type { HomeSummary } from '@/types/home';

interface HomeStat {
  Icon: LucideIcon;
  iconClass: string;
  value: number | string;
  label: string;
}

interface HomeScreenProps {
  // 서버에서 조회한 요약(스테이지·XP·연속일·오늘 완료·정답률)
  summary: HomeSummary;
  // 서버에서 조회한 내 아바타(캐릭터·색상·닉네임)
  avatar: {
    characterType: CharacterType;
    colorTheme: ColorTheme;
    nickname: string;
  };
}

export function HomeScreen({ summary, avatar }: HomeScreenProps) {
  const router = useRouter();

  // 진행률(%)
  const accessPercent = Math.min(100, (summary.accessStreak / summary.accessStreakMax) * 100);
  const xpPercent = Math.min(100, (summary.xp / summary.xpForNextLevel) * 100);

  const stats: HomeStat[] = [
    {
      Icon: CircleCheck,
      iconClass: 'text-accent-green',
      value: summary.todayCompleted,
      label: '오늘 완료',
    },
    { Icon: Flame, iconClass: 'text-coral', value: summary.learnStreak, label: '연속 일수' },
    {
      Icon: Target,
      iconClass: 'text-accent-magenta',
      value: `${summary.accuracyPercent}%`,
      label: '정답률',
    },
  ];

  const handleStart = () => {
    router.push(ROUTES.LEARNING);
  };

  return (
    <div className="bg-sand mx-auto flex min-h-dvh w-full max-w-[430px] flex-col">
      <main className="flex-1 px-6 pb-6">
        {/* 상단바 */}
        <header className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-2">
            <span className="bg-coral flex size-9 items-center justify-center overflow-hidden rounded-xl">
              <CharacterRenderer
                characterType={avatar.characterType}
                colorTheme={avatar.colorTheme}
                className="size-8 translate-y-1"
              />
            </span>
            <h1 className="text-plum text-xl font-extrabold">멘헤링</h1>
          </div>
          <button
            type="button"
            aria-label="알림"
            className="flex size-10 items-center justify-center rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] active:opacity-70"
          >
            <Bell className="text-coral size-5" aria-hidden />
          </button>
        </header>

        {/* 말풍선 */}
        <div className="mt-4 flex justify-center">
          <div className="border-coral/30 relative rounded-full border-2 bg-white px-5 py-2.5 shadow-sm">
            <p className="text-plum flex items-center gap-1 text-sm font-bold">
              {avatar.nickname}님, {summary.greeting}
              <Sparkles className="text-coral size-4" aria-hidden />
            </p>
            <span className="border-coral/30 absolute -bottom-1.5 left-1/2 size-3 -translate-x-1/2 rotate-45 border-r-2 border-b-2 bg-white" />
          </div>
        </div>

        {/* 마스코트 */}
        <div className="mt-6 flex justify-center">
          <CharacterRenderer
            characterType={avatar.characterType}
            colorTheme={avatar.colorTheme}
            className="size-44 drop-shadow-sm"
            title="내 아바타"
          />
        </div>

        {/* 마지막 접속 */}
        <Section isBorder className="mt-6 bg-white/60 py-3">
          <p className="text-coral text-center text-xs font-bold">마지막 접속 - 오늘</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-brown-soft text-[10px] font-bold">오늘</span>
            {/* 진행률(--access-pct)은 런타임 동적 값이라 CSS 변수로 주입, 폭·위치는 Tailwind 클래스가 참조 */}
            <div
              className="bg-coral-soft/40 relative h-1.5 flex-1 rounded-full"
              style={{ '--access-pct': `${accessPercent}%` } as CSSProperties}
            >
              <div className="bg-coral absolute inset-y-0 left-0 w-(--access-pct) rounded-full" />
              <span className="border-coral absolute top-1/2 left-(--access-pct) size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-white" />
            </div>
            <span className="text-brown-soft text-[10px] font-bold">
              {summary.accessStreakMax}일+
            </span>
          </div>
        </Section>

        {/* 현재 스테이지 */}
        <Section shadow="custom" className="mt-4 py-5">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-brown-soft text-xs font-bold">현재 스테이지</span>
              <span className="text-plum inline-flex items-center gap-1.5 text-2xl font-extrabold">
                Stage {summary.stage}
                <PawPrint className="text-coral/50 size-5" aria-hidden />
              </span>
            </div>
            <span className="bg-coral-soft/50 text-coral flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-extrabold">
              <Star className="fill-coral size-4" aria-hidden /> {summary.xp} XP
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs font-bold">
            <span className="text-brown-soft">다음 레벨까지</span>
            <span className="text-plum">
              {summary.xp} / {summary.xpForNextLevel} XP
            </span>
          </div>
          {/* 진행률(--xp-pct)은 런타임 동적 값이라 CSS 변수로 주입, 폭은 Tailwind 클래스가 참조 */}
          <div
            className="bg-coral-soft/40 mt-1.5 h-2 w-full overflow-hidden rounded-full"
            style={{ '--xp-pct': `${xpPercent}%` } as CSSProperties}
          >
            <div className="bg-coral h-full w-(--xp-pct) rounded-full transition-[width]" />
          </div>

          <div className="border-cream mt-4 grid grid-cols-3 gap-2 border-t pt-4 text-center">
            {stats.map(({ Icon, iconClass, value, label }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <Icon className={cn('size-5', iconClass)} aria-hidden />
                <span className="text-plum text-base font-extrabold">{value}</span>
                <span className="text-brown-soft text-[11px] font-medium">{label}</span>
              </div>
            ))}
          </div>
        </Section>

        <div className="mt-6">
          <Button
            variant="primary"
            isFullWidth
            rightIcon={<ChevronRight className="size-5" aria-hidden />}
            onClick={handleStart}
          >
            학습 시작하기
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
