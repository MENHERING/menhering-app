'use client';

import { useMemo, useState } from 'react';

import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/common/Button';
import { Header } from '@/components/common/Header';
import { WrongNoteCard } from '@/components/wrong-note/WrongNoteCard';
import { WrongNoteFilterBar } from '@/components/wrong-note/WrongNoteFilterBar';
import { WrongNoteStatsRow } from '@/components/wrong-note/WrongNoteStatsRow';
import { MOCK_WRONG_NOTE_ITEMS, MOCK_WRONG_NOTE_STATS } from '@/mocks/wrong-note.mock';
import type { WrongNoteFilter, WrongNoteSubject } from '@/types/wrong-note';

export function WrongNoteScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<WrongNoteFilter>('all');

  const subjects = useMemo<WrongNoteSubject[]>(
    () => [...new Set(MOCK_WRONG_NOTE_ITEMS.map((item) => item.subject))],
    [],
  );

  const filteredItems = useMemo(
    () =>
      MOCK_WRONG_NOTE_ITEMS.filter((item) => {
        if (activeFilter === 'all') return true;
        if (activeFilter === 'unreviewed') return item.reviewStatus === 'unreviewed';
        if (activeFilter === 'reviewed') return item.reviewStatus === 'reviewed';
        return item.subject === activeFilter;
      }),
    [activeFilter],
  );

  return (
    <>
      <Header title="오답 노트" leftType="back" onLeftPress={() => router.back()} />
      <main className="flex-1 pb-6">
        <WrongNoteStatsRow stats={MOCK_WRONG_NOTE_STATS} />
        <WrongNoteFilterBar
          activeFilter={activeFilter}
          onChange={setActiveFilter}
          stats={MOCK_WRONG_NOTE_STATS}
          subjects={subjects}
        />
        <div className="flex flex-col gap-3 px-4 pt-3">
          {filteredItems.map((item) => (
            <WrongNoteCard key={item.id} item={item} />
          ))}
        </div>
        {MOCK_WRONG_NOTE_STATS.unreviewed > 0 && (
          <div className="px-4 pt-6">
            <Button
              isFullWidth
              rightIcon={<ArrowRight className="size-4" strokeWidth={3} aria-hidden />}
              className="bg-coral-accent hover:bg-coral-accent"
            >
              미복습 문제 한 번에 풀기
            </Button>
          </div>
        )}
      </main>
    </>
  );
}
