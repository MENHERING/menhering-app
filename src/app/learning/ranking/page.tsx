'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { Footer } from '@/components/common/Footer';
import { Header } from '@/components/common/Header';
import { RankingList } from '@/components/ranking/RankingList';
import { RankingPeriodTabs } from '@/components/ranking/RankingPeriodTabs';
import { RankingPodium } from '@/components/ranking/RankingPodium';
import { MOCK_RANKING, MOCK_RANKING_WEEK } from '@/mocks/ranking';
import type { RankingPeriod } from '@/types/ranking';

export default function RankingPage() {
  const router = useRouter();
  const [period, setPeriod] = useState<RankingPeriod>('week');

  const entries = period === 'week' ? MOCK_RANKING_WEEK : MOCK_RANKING;
  const [first, second, third, ...rest] = entries;

  return (
    <div className="bg-linen mx-auto flex min-h-dvh w-full max-w-[430px] flex-col">
      <Header title="친구 랭킹" leftType="back" onLeftPress={() => router.back()} />

      <main className="flex-1 space-y-6 py-4">
        <RankingPeriodTabs selected={period} onSelect={setPeriod} />
        {first && second && third && <RankingPodium first={first} second={second} third={third} />}
        <RankingList entries={rest} />
      </main>

      <Footer />
    </div>
  );
}
