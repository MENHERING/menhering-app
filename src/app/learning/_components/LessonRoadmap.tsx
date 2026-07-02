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

// 노드를 좌우로 번갈아 배치해 곡선 경로처럼 보이게 한다. (RoadPath, LessonStartCard의 ±72px과 동일하게 유지)
// 좌우 폭과 세로 간격 비율(72:80)이 완만한 대각선이 되도록 맞춘 값.
const OFFSET_X = ['translate-x-[72px]', '-translate-x-[72px]'];

// 아래 상수는 컨테이너의 실제 레이아웃(노드 h-20=80px, gap-20=80px, py-8=32px)과 맞춰
// 선택된 레슨 카드의 절대 위치(top)를 계산하는 데 쓰인다.
const NODE_SIZE_PX = 80;
const ROW_GAP_PX = 80;
const TOP_PADDING_PX = 32;

export function LessonRoadmap({
  lessons,
  level,
  selectedLessonId,
  onSelectLesson,
}: LessonRoadmapProps) {
  // 완료한 레슨이 위, 잠긴 레슨이 아래로 오도록 위→아래 진행 방향으로 표시한다.
  // (아래→위로 하면 시작 카드가 아래쪽의 완료된 레슨을 가려서 위→아래로 되돌렸다.)
  const displayLessons = lessons;
  const selectedIndex = displayLessons.findIndex((lesson) => lesson.id === selectedLessonId);
  const selectedLesson = selectedIndex === -1 ? null : displayLessons[selectedIndex];

  return (
    <div className="relative flex flex-col items-center gap-20 py-8">
      {displayLessons.map((lesson, index) => (
        <div key={lesson.id} className={cn('relative', OFFSET_X[index % 2])}>
          {index < displayLessons.length - 1 && (
            <RoadPath direction={index % 2 === 0 ? 'right-to-left' : 'left-to-right'} />
          )}
          <LessonNode
            order={lesson.order}
            status={lesson.status}
            isSelected={lesson.id === selectedLessonId}
            onPress={lesson.status === 'current' ? () => onSelectLesson(lesson.id) : undefined}
          />
        </div>
      ))}

      {selectedLesson && (
        <div
          className="absolute left-1/2 w-[calc(100%-7rem)] -translate-x-1/2"
          style={{ top: TOP_PADDING_PX + selectedIndex * (NODE_SIZE_PX + ROW_GAP_PX) + NODE_SIZE_PX }}
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
