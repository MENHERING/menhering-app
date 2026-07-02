import { Fragment } from 'react';

import { LessonNode } from '@/app/learning/_components/LessonNode';
import { LessonStartCard } from '@/app/learning/_components/LessonStartCard';
import { RoadPath } from '@/app/learning/_components/RoadPath';
import { cn } from '@/lib/cn';
import type { Lesson } from '@/types/lesson';

interface LessonRoadmapProps {
  lessons: Lesson[];
  level: string;
  selectedLessonId: string | null;
  onSelectLesson: (lessonId: string) => void;
}

// 노드를 좌우로 번갈아 배치해 곡선 경로처럼 보이게 한다.
const OFFSET_X = ['translate-x-10', '-translate-x-10'];

export function LessonRoadmap({
  lessons,
  level,
  selectedLessonId,
  onSelectLesson,
}: LessonRoadmapProps) {
  // 완료한 레슨이 아래, 잠긴 레슨이 위로 오도록 아래→위 진행 방향으로 표시한다.
  const displayLessons = [...lessons].reverse();

  return (
    <div className="flex flex-col items-center gap-10 py-8">
      {displayLessons.map((lesson, index) => {
        const isSelected = lesson.id === selectedLessonId;

        return (
          <Fragment key={lesson.id}>
            <div className={cn('relative', OFFSET_X[index % 2])}>
              {index < displayLessons.length - 1 && !isSelected && (
                <RoadPath direction={index % 2 === 0 ? 'right-to-left' : 'left-to-right'} />
              )}
              <LessonNode
                order={lesson.order}
                status={lesson.status}
                isSelected={isSelected}
                onPress={lesson.status === 'current' ? () => onSelectLesson(lesson.id) : undefined}
              />
            </div>

            {isSelected && (
              <LessonStartCard
                level={level}
                lesson={lesson}
                pointerAlign={index % 2 === 0 ? 'right' : 'left'}
              />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
