'use client';

import { notFound } from 'next/navigation';

import { RankingListItem } from '@/components/ranking/RankingListItem';
import { RankingPodium } from '@/components/ranking/RankingPodium';
import { MOCK_RANKING } from '@/mocks/ranking';

export default function TestRankingPage() {
  if (process.env.NODE_ENV !== 'development') notFound();

  const [first, second, third] = MOCK_RANKING;
  const me = MOCK_RANKING.find((entry) => entry.isMe)!;
  const others = MOCK_RANKING.find((entry) => !entry.isMe && entry.rank > 3)!;

  return (
    <main className="flex min-h-screen flex-col gap-8 bg-gray-50 px-4 py-16">
      {/* case 01: RankingPodium */}
      <div className="rounded-2xl bg-white p-6">
        <RankingPodium first={first} second={second} third={third} />
      </div>

      {/* case 02: RankingListItem - 본인(강조) / 일반 */}
      <ul className="flex flex-col gap-3">
        <RankingListItem entry={me} />
        <RankingListItem entry={others} />
      </ul>
    </main>
  );
}
