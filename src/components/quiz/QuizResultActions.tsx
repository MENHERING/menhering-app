'use client';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/common/Button';
import { ROUTES } from '@/constants/routes';

export function QuizResultActions() {
  const router = useRouter();
  const goToLearning = () => router.push(ROUTES.LEARNING);

  return (
    <div className="mx-5 mt-auto flex flex-col gap-3">
      {/* TODO: 다음 레슨으로 바로 진입하는 라우팅은 후속 이슈. 지금은 학습 로드맵으로 이동한다. */}
      <Button variant="primary" size="lg" isFullWidth onClick={goToLearning}>
        다음 스테이지
      </Button>
      <Button variant="secondary" size="lg" isFullWidth onClick={goToLearning}>
        홈으로
      </Button>
    </div>
  );
}
