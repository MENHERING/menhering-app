import { LessonNode } from '@/components/learning/LessonNode';
import { LessonStartCard } from '@/components/learning/LessonStartCard';
import { NODE_OFFSET_PX } from '@/components/learning/roadmap-layout';
import { RoadPath } from '@/components/learning/RoadPath';
import type { Lesson } from '@/types/lesson';

interface LessonRoadmapProps {
  lessons: Lesson[];
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

  return (
    <div className="relative flex flex-col items-center gap-20 py-8">
      {lessons.map((lesson, index) => {
        // 노드를 좌우로 번갈아 배치해 곡선 경로처럼 보이게 한다.
        const offset = index % 2 === 0 ? NODE_OFFSET_PX : -NODE_OFFSET_PX;

        return (
          <div
            key={lesson.id}
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
              onPress={lesson.status === 'current' ? () => onSelectLesson(lesson.id) : undefined}
            />
          </div>
        );
      })}

      {selectedLesson && (
        <div
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
