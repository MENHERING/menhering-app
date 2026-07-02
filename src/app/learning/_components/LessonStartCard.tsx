import { Button } from '@/components/common/Button';
import { cn } from '@/lib/cn';
import type { Lesson } from '@/types/lesson';

interface LessonStartCardProps {
  level: string;
  lesson: Lesson;
  // 카드 위 노드가 어느 쪽에 있는지에 맞춰 말풍선 꼬리 위치를 정한다.
  pointerAlign: 'left' | 'right';
}

export function LessonStartCard({ level, lesson, pointerAlign }: LessonStartCardProps) {
  return (
    <div className="relative mx-14 -my-4 self-stretch">
      <span
        aria-hidden
        className={cn(
          'bg-coral absolute -top-2 left-1/2 h-4 w-4 rotate-45 rounded-sm',
          pointerAlign === 'right'
            ? 'translate-x-[calc(-50%+40px)]'
            : 'translate-x-[calc(-50%-40px)]',
        )}
      />

      <div className="bg-coral relative flex flex-col gap-2.5 rounded-2xl p-4 text-white shadow-[0_8px_20px_rgba(0,0,0,0.18)]">
        <div>
          <p className="text-xs font-medium text-white/85">
            {level} · 레슨 {lesson.order}
          </p>
          <h2 className="text-base font-bold">{lesson.title}</h2>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-white/85">
            레슨 · {lesson.problemCount}문제
          </span>
          <div className="flex gap-1.5">
            {Array.from({ length: lesson.problemCount }).map((_, index) => (
              <span
                key={`problem-dot-${index}`}
                className={cn('h-2 w-2 rounded-full', index === 0 ? 'bg-white' : 'bg-white/40')}
              />
            ))}
          </div>
        </div>

        <Button
          variant="secondary"
          size="md"
          isFullWidth
          onClick={() => {
            // TODO: 레슨 상세 화면 라우팅 연결
          }}
        >
          시작하기 +{lesson.xpReward} XP
        </Button>
      </div>
    </div>
  );
}
