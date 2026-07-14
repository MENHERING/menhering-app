'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { ROUTES } from '@/constants/routes';
import { saveOnboardingLevel } from '@/lib/onboarding/actions';
import { useUserLevelStore } from '@/stores/user-level-store';

// 온보딩 완료(레벨 확정) 처리. 레벨 선택 화면과 실력테스트 결과 화면이 함께 쓴다.
// 저장 성공 시 세션 캐시(스토어)를 갱신하고 홈으로 이동한다.
export function useSaveOnboardingLevel() {
  const router = useRouter();
  const setStep = useUserLevelStore((state) => state.setStep);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const save = async (step: number) => {
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const result = await saveOnboardingLevel({ step });

      if (!result.ok) {
        setErrorMessage(result.error);
        return;
      }

      setStep(step);
      // replace: 레벨 확정 후 뒤로가기로 온보딩에 되돌아오지 않도록 한다.
      router.replace(ROUTES.HOME);
    } catch (error) {
      console.error('[onboarding] 레벨 저장 중 오류:', error);
      setErrorMessage('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const clearError = () => setErrorMessage(null);

  return { save, isSaving, errorMessage, clearError };
}
