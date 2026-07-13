'use client';

import { useEffect, useState } from 'react';

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

  const defaultCurriculumId =
    MOCK_CURRICULA.find((curriculum) => curriculum.step === myStep)?.id ?? MOCK_CURRICULA[0].id;

  // 기본 선택 커리큘럼은 내 레벨과 같은 난이도. 온보딩을 다시 거쳐 내 레벨(myStep)이
  // 바뀌면 렌더 중에 override를 리셋해 새 레벨의 커리큘럼을 다시 기본값으로 보여준다.
  const [lastSyncedStep, setLastSyncedStep] = useState(myStep);
  const [curriculumOverrideId, setCurriculumOverrideId] = useState<string | null>(null);
  if (myStep !== lastSyncedStep) {
    setLastSyncedStep(myStep);
    setCurriculumOverrideId(null);
  }
  const selectedCurriculumId = curriculumOverrideId ?? defaultCurriculumId;

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

  // 드롭다운이 열려 있을 때 Esc로도 닫을 수 있게 한다.
  useEffect(() => {
    if (!isDropdownOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsDropdownOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isDropdownOpen]);

  const handleSelectLesson = (lessonId: string) => {
    setSelectedLessonId((prev) => (prev === lessonId ? null : lessonId));
  };

  const handleSelectCurriculum = (curriculumId: string) => {
    setCurriculumOverrideId(curriculumId);
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
        <div className="relative">
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
            <>
              {/* 바깥 영역 탭하면 닫히는 투명 오버레이 */}
              <button
                type="button"
                aria-label="난이도 목록 닫기"
                onClick={() => setIsDropdownOpen(false)}
                className="fixed inset-0 z-10"
              />
              <div className="absolute inset-x-0 top-full z-20">
                <CurriculumDropdown
                  curricula={MOCK_CURRICULA}
                  myStep={myStep}
                  selectedId={selectedCurriculumId}
                  onSelect={handleSelectCurriculum}
                />
              </div>
            </>
          )}
        </div>
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
