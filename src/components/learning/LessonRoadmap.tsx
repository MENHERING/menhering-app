'use client';

import { useEffect, useRef } from 'react';

import { LessonNode } from '@/components/learning/LessonNode';
import { LessonStartCard } from '@/components/learning/LessonStartCard';
import { NODE_OFFSET_PX } from '@/components/learning/roadmap-layout';
import { RoadPath } from '@/components/learning/RoadPath';
import type { LessonWithStatus } from '@/types/lesson';

interface LessonRoadmapProps {
  lessons: LessonWithStatus[];
  level: string;
  selectedLessonId: string | null;
  onSelectLesson: (lessonId: string) => void;
}

// 선택된 레슨 카드의 절대 top 위치 계산용 (노드 h-20, gap-20, py-8과 동일하게 유지)
const NODE_SIZE_PX = 80;
const ROW_GAP_PX = 80;
const TOP_PADDING_PX = 32;

export function LessonRoadmap({
  lessons,
  level,
  selectedLessonId,
  onSelectLesson,
}: LessonRoadmapProps) {
  const selectedIndex = lessons.findIndex((lesson) => lesson.id === selectedLessonId);
  const selectedLesson = selectedIndex === -1 ? null : lessons[selectedIndex];
  const scrollTargetRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  // 커리큘럼을 다 클리어해 "현재" 스테이지가 없는 경우엔 마지막 스테이지로 스크롤한다.
  const scrollTargetId =
    lessons.find((lesson) => lesson.status === 'current')?.id ?? lessons.at(-1)?.id;

  // 스테이지 수가 늘어나도 진입 시 항상 "지금 내 위치"부터 보이게 스크롤한다.
  useEffect(() => {
    scrollTargetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [scrollTargetId]);

  // 시작하기 카드가 열려 있을 때 Esc, 또는 카드 바깥(스테이지 사이 빈 배경 포함) 클릭으로도
  // 닫을 수 있게 한다. 스테이지 노드(버튼) 클릭은 자기 자신의 토글 로직에 맡기고 건드리지 않는다
  // — 여기서 같이 닫아버리면 열린 노드를 다시 눌러 닫으려 할 때 닫혔다 바로 재열림하는 충돌이 난다.
  // onSelectLesson은 같은 id를 다시 넘기면 토글되어 닫히는 로직이라 그대로 재사용한다.
  useEffect(() => {
    if (!selectedLessonId) return;

    const close = () => onSelectLesson(selectedLessonId);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest('button')) return;
      if (cardRef.current && !cardRef.current.contains(target)) close();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedLessonId, onSelectLesson]);

  return (
    <div className="relative flex flex-col items-center gap-20 py-8">
      {lessons.map((lesson, index) => {
        // 노드를 좌우로 번갈아 배치해 곡선 경로처럼 보이게 한다.
        const offset = index % 2 === 0 ? NODE_OFFSET_PX : -NODE_OFFSET_PX;
        // 완료된 스테이지도 복습으로 다시 풀 수 있게 클릭 가능하게 둔다. 잠긴 것만 막는다.
        const isSelectable = lesson.status !== 'locked';

        return (
          <div
            key={lesson.id}
            ref={lesson.id === scrollTargetId ? scrollTargetRef : undefined}
            className="relative"
            style={{ transform: `translateX(${offset}px)` }}
          >
            {index < lessons.length - 1 && (
              <RoadPath direction={index % 2 === 0 ? 'right-to-left' : 'left-to-right'} />
            )}
            <LessonNode
              order={lesson.order}
              status={lesson.status}
              isSelected={lesson.id === selectedLessonId}
              onPress={isSelectable ? () => onSelectLesson(lesson.id) : undefined}
            />
          </div>
        );
      })}

      {selectedLesson && (
        <div
          ref={cardRef}
          className="absolute left-1/2 w-[calc(100%-7rem)] -translate-x-1/2"
          style={{
            top: TOP_PADDING_PX + selectedIndex * (NODE_SIZE_PX + ROW_GAP_PX) + NODE_SIZE_PX,
          }}
        >
          <LessonStartCard
            level={level}
            lesson={selectedLesson}
            pointerAlign={selectedIndex % 2 === 0 ? 'right' : 'left'}
          />
        </div>
      )}
    </div>
  );
}
