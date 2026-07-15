'use client';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/common/Button';
import { ROUTES } from '@/constants/routes';

interface QuizResultActionsProps {
  isSuccess: boolean;
  wrongCount: number;
  // 방금 푼 레벨의 다음 스테이지 id(`${level}-${stage+1}`). 마지막 스테이지였으면 null.
  nextLessonId: string | null;
  // 방금 풀던 레벨. "스테이지 목록"이 내 배정 레벨이 아니라 이 레벨을 기본으로 보여주게 넘긴다.
  level: string;
  // 실패 시 "다시 도전하기"가 되돌아갈 방금 그 스테이지 id(`${level}-${stage}`).
  lessonId: string;
}

export function QuizResultActions({
  isSuccess,
  wrongCount,
  nextLessonId,
  level,
  lessonId,
}: QuizResultActionsProps) {
  const router = useRouter();
  const goToLearning = () => router.push(`${ROUTES.LEARNING}?level=${encodeURIComponent(level)}`);
  const goToWrongNote = () => router.push(ROUTES.WRONG_NOTE);
  // 다음 스테이지가 없으면(레벨의 마지막 스테이지) 학습 목록으로 보낸다.
  const goToNextStage = () =>
    router.push(nextLessonId ? `/learning/${nextLessonId}/quiz` : ROUTES.LEARNING);
  const retryStage = () => router.push(`/learning/${lessonId}/quiz`);

  return (
    <div className="mx-5 flex flex-col gap-3">
      {isSuccess ? (
        <Button variant="primary" size="lg" isFullWidth onClick={goToNextStage}>
          다음 스테이지
        </Button>
      ) : (
        <Button variant="primary" size="lg" isFullWidth onClick={retryStage}>
          다시 도전하기
        </Button>
      )}
      <Button variant="secondary" size="lg" isFullWidth onClick={goToLearning}>
        스테이지 목록
      </Button>
      {isSuccess && wrongCount > 0 && (
        <Button variant="ghost" size="md" isFullWidth onClick={goToWrongNote}>
          오답노트 보러가기
        </Button>
      )}
    </div>
  );
}
