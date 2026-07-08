'use client';

import { useMemo, useState } from 'react';

import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/common/Button';
import { Header } from '@/components/common/Header';
import { WrongNoteCard } from '@/components/wrong-note/list/WrongNoteCard';
import { WrongNoteFilterBar } from '@/components/wrong-note/list/WrongNoteFilterBar';
import { WrongNoteStatsRow } from '@/components/wrong-note/list/WrongNoteStatsRow';
import { useWrongNoteStore } from '@/stores/wrong-note-store';
import type { WrongNoteFilter, WrongNoteStats, WrongNoteSubject } from '@/types/wrong-note';

export function WrongNoteScreen() {
  const router = useRouter();
  const items = useWrongNoteStore((state) => state.items);
  const [activeFilter, setActiveFilter] = useState<WrongNoteFilter>('all');

  const subjects = useMemo<WrongNoteSubject[]>(
    () => [...new Set(items.map((item) => item.subject))],
    [items],
  );

  const stats = useMemo<WrongNoteStats>(() => {
    const reviewed = items.filter((item) => item.reviewStatus === 'reviewed').length;
    return { total: items.length, unreviewed: items.length - reviewed, reviewed };
  }, [items]);

  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        if (activeFilter === 'all') return true;
        if (activeFilter === 'unreviewed') return item.reviewStatus === 'unreviewed';
        if (activeFilter === 'reviewed') return item.reviewStatus === 'reviewed';
        return item.subject === activeFilter;
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
    router.push(
      `/mypage/wrong-note/${firstId}?mode=batch&queue=${unreviewedIds.join(',')}&index=0`,
    );
  };

  return (
    <>
      <Header title="오답 노트" leftType="back" onLeftPress={() => router.back()} />
      <main className="flex-1 pb-6">
        <WrongNoteStatsRow stats={stats} />
        <WrongNoteFilterBar
          activeFilter={activeFilter}
          onChange={setActiveFilter}
          stats={stats}
          subjects={subjects}
        />
        <div className="flex flex-col gap-3 px-4 pt-3">
          {filteredItems.map((item) => (
            <WrongNoteCard key={item.id} item={item} />
          ))}
        </div>
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
