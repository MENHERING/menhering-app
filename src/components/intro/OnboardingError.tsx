'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/common/Button';
import { ROUTES } from '@/constants/routes';

interface OnboardingErrorProps {
  // Next가 error.tsx에 넘겨주는 값. reset()으로 해당 라우트 세그먼트를 다시 렌더한다.
  error: Error & { digest?: string };
  reset: () => void;
}

// 온보딩 화면에서 조회/렌더가 실패했을 때의 폴백. Next 기본 에러 화면 대신 브랜드 톤으로 안내한다.
export function OnboardingError({ error, reset }: OnboardingErrorProps) {
  const router = useRouter();

  useEffect(() => {
    console.error('[onboarding] 화면 렌더 실패:', error);
  }, [error]);

  return (
    <div className="bg-sand flex min-h-dvh w-full flex-col items-center justify-center px-6">
      <div className="flex w-full max-w-[430px] flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-plum text-2xl font-extrabold tracking-tight">문제가 발생했어요</h1>
          <p className="text-primary/70 text-sm leading-6 font-medium">
            잠시 후 다시 시도해주세요. 계속되면 다시 로그인해주세요.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3">
          <Button variant="primary" isFullWidth onClick={reset}>
            다시 시도
          </Button>
          <Button variant="secondary" isFullWidth onClick={() => router.replace(ROUTES.LOGIN)}>
            로그인으로 돌아가기
          </Button>
        </div>
      </div>
    </div>
  );
}
