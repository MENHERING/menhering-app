'use client';

import type { CSSProperties } from 'react';

import {
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

import { AvatarHero } from '@/components/avatar/AvatarHero';
import { CharacterRenderer } from '@/components/avatar/CharacterRenderer';
import { Button } from '@/components/common/Button';
import { Footer } from '@/components/common/Footer';
import { Section } from '@/components/common/Section';
import { NotificationBell } from '@/components/home/NotificationBell';
import { ROUTES } from '@/constants/routes';
import { useAvatarStatus } from '@/hooks/avatar/use-avatar-status';
import { cn } from '@/lib/cn';
import { getLevelInfo } from '@/lib/level';
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

  // 감정(mood)은 편집값이 아닌 서버 파생값이라 별도 조회한다. 미해결(첫 렌더)이면 mood 없이
  // 중립으로 그리고, 도착하면 표정·심볼·기운 배경이 얹힌다(점진적 향상). 비로그인은 홈 가드에서
  // 이미 걸러지므로 privateFetch 401 리다이렉트는 사실상 발생하지 않는다.
  const { data: avatarStatus } = useAvatarStatus();

  // 누적 XP → 현재 레벨·레벨 내 진행도(500 XP당 1레벨). 누적값을 그대로 표시하지 않고
  // getLevelInfo로 파생해야 "1550 / 500"처럼 기준을 넘는 표시가 안 나온다.
  const { level, currentXp, targetXp } = getLevelInfo(summary.xp);

  // 진행률(%)
  const accessPercent = Math.min(100, (summary.accessStreak / summary.accessStreakMax) * 100);
  const xpPercent = Math.min(100, (currentXp / targetXp) * 100);

  const stats: HomeStat[] = [
    {
      Icon: CircleCheck,
      iconClass: 'text-green-accent',
      value: summary.todayCompleted,
      label: '오늘 완료',
    },
    { Icon: Flame, iconClass: 'text-coral', value: summary.learnStreak, label: '연속 일수' },
    {
      Icon: Target,
      iconClass: 'text-plum',
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
          <NotificationBell />
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

        {/* 마스코트 — 히어로 렌더러(Live2D 우선 + 감정 표정/심볼, 실패 시 SVG 폴백).
            상단바 작은 아이콘은 성능상 SVG(CharacterRenderer)로 유지한다. */}
        <div className="mt-6 flex justify-center">
          <AvatarHero
            characterType={avatar.characterType}
            colorTheme={avatar.colorTheme}
            mood={avatarStatus?.mood}
            className="size-44 drop-shadow-sm"
            size={176}
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
              <Star className="fill-coral size-4" aria-hidden /> Lv.{level}
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs font-bold">
            <span className="text-brown-soft">다음 레벨까지</span>
            <span className="text-plum">
              {currentXp} / {targetXp} XP
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
