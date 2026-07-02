'use client';

import { notFound } from 'next/navigation';

import { LessonNode } from '@/app/learning/_components/LessonNode';
import { LessonStartCard } from '@/app/learning/_components/LessonStartCard';
import { UserStatusBar } from '@/app/learning/_components/UserStatusBar';
import { MOCK_LESSONS, MOCK_USER_PROGRESS } from '@/mocks/lessons';

export default function TestLearningPage() {
  if (process.env.NODE_ENV !== 'development') notFound();

  const currentLesson = MOCK_LESSONS.find((lesson) => lesson.status === 'current')!;

  return (
    <main className="flex min-h-screen flex-col gap-8 bg-gray-50 px-4 py-16">
      {/* case 01: UserStatusBar */}
      <UserStatusBar
        level={MOCK_USER_PROGRESS.level}
        xp={MOCK_USER_PROGRESS.xp}
        avatarSrc={MOCK_USER_PROGRESS.avatarSrc}
      />

      {/* case 02: LessonNode - completed / current / locked */}
      <div className="flex items-center gap-6 rounded-2xl bg-white p-6">
        <LessonNode order={1} status="completed" />
        <LessonNode order={3} status="current" />
        <LessonNode order={4} status="locked" />
      </div>

      {/* case 03: LessonStartCard */}
      <LessonStartCard level="초급" lesson={currentLesson} pointerAlign="right" />
    </main>
  );
}
