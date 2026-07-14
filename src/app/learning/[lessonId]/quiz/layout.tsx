'use client';

import { notFound, useParams, useRouter } from 'next/navigation';

import { Header } from '@/components/common/Header';
import { ROUTES } from '@/constants/routes';
import { parseLessonId } from '@/lib/parse-lesson-id';

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { lessonId } = useParams<{ lessonId: string }>();
  const { stage } = parseLessonId(lessonId);

  if (!Number.isInteger(stage) || stage < 1) notFound();

  return (
    <div className="bg-linen mx-auto flex min-h-dvh w-full max-w-[430px] flex-col">
      <Header
        title={`스테이지 ${stage}`}
        leftType="none"
        rightType="close"
        onRightPress={() => router.push(ROUTES.LEARNING)}
      />

      <main className="flex-1 space-y-6 py-6">{children}</main>
    </div>
  );
}
