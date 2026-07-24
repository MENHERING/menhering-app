'use client';

import { useRouter } from 'next/navigation';

import { Spinner } from '@/components/common/Spinner';
import { RankingEmptyState } from '@/components/ranking/RankingEmptyState';
import { RankingList } from '@/components/ranking/RankingList';
import { RankingPodium } from '@/components/ranking/RankingPodium';
import { ROUTES } from '@/constants/routes';
import { useFriendRanking } from '@/hooks/friends/use-friend-ranking';

export default function RankingPage() {
  const router = useRouter();
  const { data: entries, isPending, error } = useFriendRanking();

  if (isPending || error) {
    return (
      <p className="text-brown-muted flex items-center justify-center py-20 text-sm">
        {error ? '랭킹을 불러오지 못했어요.' : <Spinner />}
      </p>
    );
  }

  const hasStartedLearning = (entries.find((entry) => entry.isMe)?.xp ?? 0) > 0;
  const hasFriends = entries.some((entry) => !entry.isMe);
  // 포디움은 본인 포함 랭킹 전체의 1~3등(친구만이 아니라 본인도 포디움에 들 수 있다)이라
  // 정확히 3자리다 — 본인 포함 총원이 3명 미만이면 아예 못 채우므로 그 경우 포디움 없이
  // 전원을 리스트로만 보여준다. 목업은 항상 9명이라 이 경계 케이스가 실사용 전엔 안 드러났다.
  const [first, second, third] = entries;
  const hasPodium = entries.length >= 3;

  return (
    <>
      {!hasStartedLearning ? (
        <RankingEmptyState
          variant="not-started"
          onStartLearning={() => router.push(ROUTES.LEARNING)}
        />
      ) : !hasFriends ? (
        <RankingEmptyState
          variant="no-friends"
          onAddFriend={() => router.push(ROUTES.MYPAGE_FRIENDS_ADD)}
        />
      ) : hasPodium ? (
        <>
          <RankingPodium first={first} second={second} third={third} />
          <RankingList entries={entries.slice(3)} />
        </>
      ) : (
        <RankingList entries={entries} />
      )}
    </>
  );
}
