'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { Footer } from '@/components/common/Footer';
import { CurriculumBar } from '@/components/learning/CurriculumBar';
import { CurriculumDropdown } from '@/components/learning/CurriculumDropdown';
import { LessonRoadmap } from '@/components/learning/LessonRoadmap';
import { UserStatusBar } from '@/components/learning/UserStatusBar';
import { ROUTES } from '@/constants/routes';
import { getLessonStatus } from '@/lib/curriculum-lock';
import { MOCK_CURRICULA, MOCK_LESSONS, MOCK_USER_PROGRESS } from '@/mocks/lessons';
import { useUserLevelStore } from '@/stores/user-level-store';

export default function LearningPage() {
  const router = useRouter();
  const myStep = useUserLevelStore((state) => state.step);

  // 기본 선택 커리큘럼은 내 레벨과 같은 난이도
  const [selectedCurriculumId, setSelectedCurriculumId] = useState(
    () =>
      MOCK_CURRICULA.find((curriculum) => curriculum.step === myStep)?.id ?? MOCK_CURRICULA[0].id,
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // 이슈 스펙대로 진입 시에는 카드가 닫혀 있고, 현재 스테이지 노드를 탭해야 열린다.
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  const selectedCurriculum =
    MOCK_CURRICULA.find((curriculum) => curriculum.id === selectedCurriculumId) ??
    MOCK_CURRICULA[0];

  const lessons = MOCK_LESSONS.filter((lesson) => lesson.curriculumId === selectedCurriculumId).map(
    (lesson) => ({
      ...lesson,
      status: getLessonStatus(lesson.order, selectedCurriculum.clearedCount),
    }),
  );

  const handleSelectLesson = (lessonId: string) => {
    setSelectedLessonId((prev) => (prev === lessonId ? null : lessonId));
  };

  const handleSelectCurriculum = (curriculumId: string) => {
    setSelectedCurriculumId(curriculumId);
    setSelectedLessonId(null);
    setIsDropdownOpen(false);
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
          level={selectedCurriculum.level}
          title={selectedCurriculum.title}
          clearedCount={selectedCurriculum.clearedCount}
          totalCount={selectedCurriculum.totalCount}
          isDropdownOpen={isDropdownOpen}
          onTogglePress={() => setIsDropdownOpen((prev) => !prev)}
          onStatsPress={() => router.push(ROUTES.RANKING)}
        />
        {isDropdownOpen && (
          <CurriculumDropdown
            curricula={MOCK_CURRICULA}
            myStep={myStep}
            selectedId={selectedCurriculumId}
            onSelect={handleSelectCurriculum}
          />
        )}
        <LessonRoadmap
          lessons={lessons}
          level={selectedCurriculum.level}
          selectedLessonId={selectedLessonId}
          onSelectLesson={handleSelectLesson}
        />
      </main>

      <Footer />
    </div>
  );
}
