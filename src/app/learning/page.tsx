'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { Footer } from '@/components/common/Footer';
import { CurriculumBar } from '@/components/learning/CurriculumBar';
import { CurriculumDropdown } from '@/components/learning/CurriculumDropdown';
import { LessonRoadmap } from '@/components/learning/LessonRoadmap';
import { UserStatusBar } from '@/components/learning/UserStatusBar';
import { CURRICULUM_TITLE } from '@/constants/curriculum';
import { ROUTES } from '@/constants/routes';
import { useLearningProgress } from '@/hooks/learning/use-learning-progress';
import { getLessonStatus } from '@/lib/curriculum-lock';
import { MOCK_USER_PROGRESS } from '@/mocks/lessons';
import type { Curriculum, Lesson } from '@/types/lesson';

const PROBLEM_COUNT = 5;
const XP_REWARD = 50;

// 커리큘럼 내부 스테이지 목록은 DB에 제목이 없어(questions는 level+stage로만 식별) 번호로 생성한다.
function buildLessons(curriculum: Curriculum): Lesson[] {
  return Array.from({ length: curriculum.totalCount }, (_, index) => ({
    id: `${curriculum.id}-${index + 1}`,
    curriculumId: curriculum.id,
    order: index + 1,
    title: `스테이지 ${index + 1}`,
    problemCount: PROBLEM_COUNT,
    xpReward: XP_REWARD,
  }));
}

export default function LearningPage() {
  const router = useRouter();
  const { data: progress, isLoading, isError } = useLearningProgress();

  const curricula: Curriculum[] =
    progress?.curricula.map((c) => ({
      id: c.level,
      title: CURRICULUM_TITLE[c.level] ?? c.level,
      level: c.level,
      step: c.step,
      clearedCount: c.clearedCount,
      totalCount: c.totalCount,
    })) ?? [];
  const myStep = progress?.myStep ?? 0;

  const defaultCurriculumId = curricula.find((c) => c.step === myStep)?.id ?? curricula[0]?.id;

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

  const selectedCurriculum = curricula.find((c) => c.id === selectedCurriculumId) ?? curricula[0];

  const lessons = selectedCurriculum
    ? buildLessons(selectedCurriculum).map((lesson) => ({
        ...lesson,
        status: getLessonStatus(lesson.order, selectedCurriculum.clearedCount),
      }))
    : [];

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

  if (isLoading || !selectedCurriculum) {
    return (
      <div className="bg-linen mx-auto flex min-h-dvh w-full max-w-[430px] flex-col">
        <main className="flex flex-1 items-center justify-center">
          <p className="text-brown-soft text-sm">불러오는 중...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-linen mx-auto flex min-h-dvh w-full max-w-[430px] flex-col">
        <main className="flex flex-1 items-center justify-center">
          <p className="text-wrong text-sm">진행도를 불러오지 못했어요. 다시 시도해주세요.</p>
        </main>
        <Footer />
      </div>
    );
  }

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
                  curricula={curricula}
                  myStep={myStep}
                  selectedId={selectedCurriculumId ?? ''}
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
