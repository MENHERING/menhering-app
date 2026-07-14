'use client';

import { notFound, useParams, useRouter } from 'next/navigation';

import { Header } from '@/components/common/Header';
import { ROUTES } from '@/constants/routes';
import { parseLessonId } from '@/lib/parse-lesson-id';

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { lessonId } = useParams<{ lessonId: string }>();
  const { level, stage } = parseLessonId(lessonId);

  if (!Number.isInteger(stage) || stage < 1) notFound();

  // 학습 목록으로 돌아갈 때 방금 있던 레벨이 기본으로 보이게 넘긴다.
  // (안 넘기면 LearningPage가 항상 내 배정 레벨을 기본값으로 보여줘서 엉뚱한 레벨이 뜬다.)
  const backToLearning = `${ROUTES.LEARNING}?level=${encodeURIComponent(level)}`;

  return (
    <div className="bg-linen mx-auto flex min-h-dvh w-full max-w-[430px] flex-col">
      <Header
        title={`스테이지 ${stage}`}
        leftType="none"
        rightType="close"
        onRightPress={() => router.push(backToLearning)}
      />

      <main className="flex-1 space-y-6 py-6">{children}</main>
    </div>
  );
}
