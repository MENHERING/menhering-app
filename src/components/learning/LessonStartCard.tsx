import { useRouter } from 'next/navigation';

import { Button } from '@/components/common/Button';
import { NODE_OFFSET_PX } from '@/components/learning/roadmap-layout';
import { cn } from '@/lib/cn';
import type { LessonWithStatus } from '@/types/lesson';

interface LessonStartCardProps {
  level: string;
  lesson: LessonWithStatus;
  // 카드 섹션에 따라 말풍선 꼬리 지정
  pointerAlign: 'left' | 'right';
}

export function LessonStartCard({ level, lesson, pointerAlign }: LessonStartCardProps) {
  const router = useRouter();

  return (
    <div className="relative w-full">
      <span
        aria-hidden
        className="bg-coral absolute -top-2 left-1/2 h-4 w-4 rounded-sm"
        style={{
          transform: `translateX(calc(-50% + ${pointerAlign === 'right' ? NODE_OFFSET_PX : -NODE_OFFSET_PX}px)) rotate(45deg)`,
        }}
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
          onClick={() => router.push(`/learning/${lesson.id}/quiz`)}
        >
          시작하기 +{lesson.xpReward} XP
        </Button>
      </div>
    </div>
  );
}
