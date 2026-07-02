'use client';

import { useState } from 'react';

import { CurriculumBar } from '@/app/learning/_components/CurriculumBar';
import { LessonRoadmap } from '@/app/learning/_components/LessonRoadmap';
import { UserStatusBar } from '@/app/learning/_components/UserStatusBar';
import { Footer } from '@/components/common/Footer';
import { MOCK_CURRICULUM, MOCK_LESSONS, MOCK_USER_PROGRESS } from '@/mocks/lessons';

export default function LearningPage() {
  // 이슈 스펙대로 진입 시에는 카드가 닫혀 있고, 현재 스테이지 노드를 탭해야 열린다.
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  const handleSelectLesson = (lessonId: string) => {
    setSelectedLessonId((prev) => (prev === lessonId ? null : lessonId));
  };

  return (
    <div className="bg-linen mx-auto flex min-h-dvh w-full max-w-[430px] flex-col">
      <main className="flex-1 pb-6">
        <UserStatusBar
          level={MOCK_USER_PROGRESS.level}
          xp={MOCK_USER_PROGRESS.xp}
          avatarSrc={MOCK_USER_PROGRESS.avatarSrc}
        />
        <CurriculumBar
          level={MOCK_CURRICULUM.level}
          title={MOCK_CURRICULUM.title}
          clearedCount={MOCK_CURRICULUM.clearedCount}
          totalCount={MOCK_CURRICULUM.totalCount}
        />
        <LessonRoadmap
          lessons={MOCK_LESSONS}
          level={MOCK_CURRICULUM.level}
          selectedLessonId={selectedLessonId}
          onSelectLesson={handleSelectLesson}
        />
      </main>

      <Footer />
    </div>
  );
}
