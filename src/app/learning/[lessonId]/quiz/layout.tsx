'use client';

import { notFound, useParams, useRouter } from 'next/navigation';

import { Header } from '@/components/common/Header';
import { ROUTES } from '@/constants/routes';
import { MOCK_LESSONS } from '@/mocks/lessons';

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { lessonId } = useParams<{ lessonId: string }>();
  const lesson = MOCK_LESSONS.find((item) => item.id === lessonId);

  if (!lesson) notFound();

  return (
    <div className="bg-linen mx-auto flex min-h-dvh w-full max-w-[430px] flex-col">
      <Header
        title={`스테이지 ${lesson.order}`}
        leftType="none"
        rightType="close"
        onRightPress={() => router.push(ROUTES.LEARNING)}
      />

      <main className="flex-1 space-y-6 py-6">{children}</main>
    </div>
  );
}
