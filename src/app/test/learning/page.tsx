'use client';

import { notFound } from 'next/navigation';

import { LessonNode } from '@/components/learning/LessonNode';
import { LessonStartCard } from '@/components/learning/LessonStartCard';
import { UserStatusBar } from '@/components/learning/UserStatusBar';
import { getLessonStatus } from '@/lib/curriculum-lock';
import { MOCK_CURRICULA, MOCK_LESSONS, MOCK_USER_PROGRESS } from '@/mocks/lessons';

export default function TestLearningPage() {
  if (process.env.NODE_ENV !== 'development') notFound();

  const currentCurriculum = MOCK_CURRICULA[1];
  const currentLesson = MOCK_LESSONS.find(
    (lesson) =>
      lesson.curriculumId === currentCurriculum.id &&
      lesson.order === currentCurriculum.clearedCount + 1,
  )!;
  const currentLessonWithStatus = {
    ...currentLesson,
    status: getLessonStatus(currentLesson.order, currentCurriculum.clearedCount),
  };

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
      <LessonStartCard level="초급" lesson={currentLessonWithStatus} pointerAlign="right" />
    </main>
  );
}
