'use client';

import { useMemo, useState } from 'react';

import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/common/Button';
import { Header } from '@/components/common/Header';
import { WrongNoteCard } from '@/components/wrong-note/list/WrongNoteCard';
import { WrongNoteFilterBar } from '@/components/wrong-note/list/WrongNoteFilterBar';
import { WrongNoteStatsRow } from '@/components/wrong-note/list/WrongNoteStatsRow';
import { ROUTES } from '@/constants/routes';
import { useWrongNoteList } from '@/hooks/wrong-note/use-wrong-note-list';
import type { WrongNoteStats } from '@/schemas/wrong-note.schema';
import { useWrongNoteStore } from '@/stores/wrong-note-store';
import type { WrongNoteFilter } from '@/types/wrong-note';

const EMPTY_STATS: WrongNoteStats = { total: 0, unreviewed: 0, reviewed: 0 };

export function WrongNoteScreen() {
  const router = useRouter();
  const resetSolveResults = useWrongNoteStore((state) => state.resetSolveResults);
  const [activeFilter, setActiveFilter] = useState<WrongNoteFilter>('all');

  const {
    data,
    isPending,
    isError,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    fetchNextPage,
  } = useWrongNoteList();

  const items = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);
  const stats = data?.pages[0]?.stats ?? EMPTY_STATS;

  const labels = useMemo(() => [...new Set(items.map((item) => item.label))], [items]);

  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        if (activeFilter === 'all') return true;
        if (activeFilter === 'unreviewed') return item.reviewStatus === 'unreviewed';
        if (activeFilter === 'reviewed') return item.reviewStatus === 'reviewed';
        return item.label === activeFilter;
      }),
    [items, activeFilter],
  );

  const unreviewedIds = useMemo(
    () => items.filter((item) => item.reviewStatus === 'unreviewed').map((item) => item.id),
    [items],
  );

  const handleSolveUnreviewed = () => {
    const [firstId] = unreviewedIds;
    if (!firstId) return;
    resetSolveResults();
    router.push(
      `/mypage/wrong-note/${firstId}?mode=batch&queue=${unreviewedIds.join(',')}&index=0`,
    );
  };

  return (
    <>
      <Header title="오답 노트" leftType="back" onLeftPress={() => router.push(ROUTES.MYPAGE)} />
      <main className="flex-1 pb-6">
        <WrongNoteStatsRow stats={stats} />
        <WrongNoteFilterBar
          activeFilter={activeFilter}
          onChange={setActiveFilter}
          stats={stats}
          labels={labels}
        />
        <div className="flex flex-col gap-3 px-4 pt-3">
          {isPending && (
            <p className="text-brown-muted px-1 py-6 text-center text-sm">불러오는 중...</p>
          )}
          {isError && items.length === 0 && (
            <p className="text-brown-muted px-1 py-6 text-center text-sm">
              오답노트를 불러오지 못했어요.
            </p>
          )}
          {!isPending && !(isError && items.length === 0) && filteredItems.length === 0 && (
            <p className="text-brown-muted px-1 py-6 text-center text-sm">
              아직 기록된 오답이 없어요.
            </p>
          )}
          {filteredItems.map((item) => (
            <WrongNoteCard key={item.id} item={item} />
          ))}
        </div>
        {hasNextPage && (
          <div className="px-4 pt-3">
            {isFetchNextPageError && (
              <p className="text-coral-accent pb-2 text-center text-xs">
                목록을 더 불러오지 못했어요. 다시 시도해주세요.
              </p>
            )}
            <Button
              isFullWidth
              variant="outline"
              isLoading={isFetchingNextPage}
              onClick={() => fetchNextPage()}
            >
              더보기
            </Button>
          </div>
        )}
        {unreviewedIds.length > 0 && (
          <div className="sticky bottom-4 px-4 pt-6">
            <Button
              isFullWidth
              rightIcon={<ArrowRight className="size-4" strokeWidth={3} aria-hidden />}
              className="bg-coral-accent"
              onClick={handleSolveUnreviewed}
            >
              미복습 문제 한 번에 풀기
            </Button>
          </div>
        )}
      </main>
    </>
  );
}
