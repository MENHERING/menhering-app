'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { FriendsSection } from '@/components/mypage/FriendsSection';
import { LearningStatsSection } from '@/components/mypage/LearningStatsSection';
import { LogoutSheet } from '@/components/mypage/logout/LogoutSheet';
import { MenuRow } from '@/components/mypage/MenuRow';
import { ProfileSection } from '@/components/mypage/ProfileSection';
import { StatCard } from '@/components/mypage/StatCard';
import { ROUTES } from '@/constants/routes';
import { useMyPageSummary } from '@/hooks/mypage/use-mypage-summary';
import { getKstWeekdayLabel } from '@/lib/date/kst';
import {
  MOCK_MYPAGE_FRIENDS,
  MOCK_MYPAGE_LOGOUT,
  MOCK_MYPAGE_PROFILE,
  MOCK_MYPAGE_SETTINGS,
  MOCK_MYPAGE_WRONG_NOTE,
} from '@/mocks/mypage.mock';
import type { ChartBar, StatCardItem } from '@/types/mypage/model';

export function MyPageScreen() {
  const router = useRouter();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const { data: summary, isPending, isError } = useMyPageSummary();

  const handleLogoutConfirm = () => {
    setIsLogoutOpen(false);
    // TODO: 실제 인증 로그아웃 연동
    router.push(ROUTES.HOME);
  };

  if (isPending || isError || !summary) {
    return (
      <main className="flex flex-1 items-center justify-center pb-6">
        <p className="text-brown-muted text-sm">
          {isError ? '마이페이지를 불러오지 못했어요.' : '불러오는 중...'}
        </p>
      </main>
    );
  }

  // 아바타 이미지는 아직 실 연동 전(팀 논의 중)이라 mock 값을 그대로 붙인다.
  const profile = { ...summary.profile, avatarUrl: MOCK_MYPAGE_PROFILE.avatarUrl };

  const statsRow1: StatCardItem[] = [
    {
      value: `${summary.stats.streakDays}일`,
      label: '연속 학습',
      variant: 'continuous_learning',
    },
    {
      value: `${summary.stats.completedProblems}`,
      label: '완료 문제',
      variant: 'completed_learning',
    },
    { value: `${summary.stats.totalSessions}회`, label: '총 학습', variant: 'total_learning' },
  ];

  const statsRow2: StatCardItem[] = [
    { value: summary.stats.totalXp.toLocaleString(), label: '총 XP', variant: 'total_exp' },
    { value: `${summary.stats.accuracyPercent}%`, label: '정답률', variant: 'correct_rate' },
  ];

  // 오늘 요일에 해당하는 막대만 하이라이트한다(차트 자체는 서버가 raw 값만 내려줌).
  const todayLabel = getKstWeekdayLabel(new Date());
  const toChartBar = (bar: { label: string; value: number }): ChartBar => ({
    ...bar,
    isHighlighted: bar.label === todayLabel,
  });

  return (
    <>
      <main className="flex-1 pb-6">
        <h1 className="text-brown-ink px-5 pt-5 pb-3 text-xl leading-7 font-bold">마이페이지</h1>

        <ProfileSection profile={profile} />

        <section className="grid grid-cols-3 gap-2 px-5">
          {statsRow1.map((stat) => (
            <StatCard
              key={stat.label}
              value={stat.value}
              label={stat.label}
              variant={stat.variant}
            />
          ))}
        </section>

        <section className="mt-2 grid grid-cols-2 gap-2 px-5">
          {statsRow2.map((stat) => (
            <StatCard
              key={stat.label}
              value={stat.value}
              label={stat.label}
              variant={stat.variant}
            />
          ))}
        </section>

        <LearningStatsSection
          weeklyData={summary.weeklyChart.map(toChartBar)}
          dailyData={summary.dailyChart.map(toChartBar)}
        />

        <div className="flex flex-col gap-2 px-5 pt-4">
          <MenuRow
            icon={MOCK_MYPAGE_WRONG_NOTE.icon}
            title={MOCK_MYPAGE_WRONG_NOTE.title}
            description={MOCK_MYPAGE_WRONG_NOTE.description}
            onClick={() => router.push(ROUTES.WRONG_NOTE)}
          />
        </div>

        <FriendsSection
          items={MOCK_MYPAGE_FRIENDS}
          onRanking={() => router.push(ROUTES.RANKING)}
          onAddFriend={() => router.push(ROUTES.MYPAGE_FRIENDS_ADD)}
        />

        <div className="flex flex-col gap-2 px-5 pt-4">
          <MenuRow
            icon={MOCK_MYPAGE_SETTINGS.icon}
            title={MOCK_MYPAGE_SETTINGS.title}
            description={MOCK_MYPAGE_SETTINGS.description}
            onClick={() => router.push(ROUTES.MYPAGE_SETTINGS)}
          />
          <MenuRow
            icon={MOCK_MYPAGE_LOGOUT.icon}
            title={MOCK_MYPAGE_LOGOUT.title}
            onClick={() => setIsLogoutOpen(true)}
          />
        </div>
      </main>

      <LogoutSheet
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        onConfirm={handleLogoutConfirm}
      />
    </>
  );
}
