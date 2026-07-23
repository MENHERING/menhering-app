'use client';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/common/Button';
import { ROUTES } from '@/constants/routes';

interface QuizResultActionsProps {
  isSuccess: boolean;
  // 이 스테이지를 처음 깼는지(복습 재클리어면 false). xpReward > 0과 동일한 신호.
  isFirstClear: boolean;
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
  isFirstClear,
  wrongCount,
  nextLessonId,
  level,
  lessonId,
}: QuizResultActionsProps) {
  const router = useRouter();
  // 마지막 스테이지를 "처음" 클리어했을 때만(=승급) 방금 레벨을 강제하지 않고 myStep 기본값을
  // 보여준다. 이미 승급한 뒤 예전 레벨을 복습으로 재클리어한 경우는 레벨 변화가 없으므로 제외.
  const goToLearning = () =>
    router.push(
      isFirstClear && !nextLessonId
        ? ROUTES.LEARNING
        : `${ROUTES.LEARNING}?level=${encodeURIComponent(level)}`,
    );
  const goToWrongNote = () => router.push(ROUTES.WRONG_NOTE);
  // nextLessonId가 없으면(레벨의 마지막 스테이지) 버튼 자체를 안 보여준다 — 아래
  // "스테이지 목록" 버튼과 동작이 겹치는 걸 막는다.
  const goToNextStage = () => nextLessonId && router.push(`/learning/${nextLessonId}/quiz`);
  const retryStage = () => router.push(`/learning/${lessonId}/quiz`);

  return (
    <div className="mx-5 flex flex-col gap-3">
      {isSuccess && nextLessonId && (
        <Button variant="primary" size="lg" isFullWidth onClick={goToNextStage}>
          다음 스테이지
        </Button>
      )}
      {!isSuccess && (
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
