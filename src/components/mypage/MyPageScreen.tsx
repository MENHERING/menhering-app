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
import {
  MOCK_MYPAGE_DAILY_CHART,
  MOCK_MYPAGE_FRIENDS,
  MOCK_MYPAGE_LOGOUT,
  MOCK_MYPAGE_PROFILE,
  MOCK_MYPAGE_SETTINGS,
  MOCK_MYPAGE_STATS_ROW1,
  MOCK_MYPAGE_STATS_ROW2,
  MOCK_MYPAGE_WEEKLY_CHART,
  MOCK_MYPAGE_WRONG_NOTE,
} from '@/mocks/mypage.mock';

export function MyPageScreen() {
  const router = useRouter();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  const handleLogoutConfirm = () => {
    setIsLogoutOpen(false);
    // TODO: 실제 인증 로그아웃 연동
    router.push(ROUTES.HOME);
  };

  return (
    <>
      <main className="flex-1 pb-6">
        <h1 className="text-brown-ink px-5 pt-5 pb-3 text-xl leading-7 font-bold">마이페이지</h1>

        <ProfileSection profile={MOCK_MYPAGE_PROFILE} />

        <section className="grid grid-cols-3 gap-2 px-5">
          {MOCK_MYPAGE_STATS_ROW1.map((stat) => (
            <StatCard
              key={stat.label}
              value={stat.value}
              label={stat.label}
              variant={stat.variant}
            />
          ))}
        </section>

        <section className="mt-2 grid grid-cols-2 gap-2 px-5">
          {MOCK_MYPAGE_STATS_ROW2.map((stat) => (
            <StatCard
              key={stat.label}
              value={stat.value}
              label={stat.label}
              variant={stat.variant}
            />
          ))}
        </section>

        <LearningStatsSection
          weeklyData={MOCK_MYPAGE_WEEKLY_CHART}
          dailyData={MOCK_MYPAGE_DAILY_CHART}
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
