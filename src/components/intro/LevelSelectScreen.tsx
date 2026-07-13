'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/common/Button';
import { Toast } from '@/components/common/Toast';
import { LEVELS } from '@/constants/level';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/cn';
import { saveOnboardingLevel } from '@/lib/onboarding/actions';
import { useUserLevelStore } from '@/stores/user-level-store';

export function LevelSelectScreen() {
  const router = useRouter();
  const step = useUserLevelStore((state) => state.step);
  const setStep = useUserLevelStore((state) => state.setStep);
  const [selected, setSelected] = useState(step);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleComplete = async () => {
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const result = await saveOnboardingLevel({ step: selected });

      if (!result.ok) {
        setErrorMessage(result.error);
        return;
      }

      setStep(selected);
      // replace: 레벨 확정 후 뒤로가기로 온보딩에 되돌아오지 않도록 한다.
      router.replace(ROUTES.HOME);
    } catch (error) {
      console.error('[onboarding] 레벨 저장 중 오류:', error);
      setErrorMessage('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-sand flex min-h-dvh w-full flex-col items-center px-6">
      <div className="flex w-full max-w-[430px] flex-1 flex-col">
        {/* 헤더 */}
        <div className="mt-12 flex flex-col gap-2">
          <h1 className="text-plum text-2xl font-extrabold tracking-tight">
            내 실력에 맞게 시작하기
          </h1>
          <p className="text-primary/70 text-sm leading-6 font-medium">
            직접 1~5단계를 고르거나 실력테스트로 추천 레벨을 받을 수 있어요.
          </p>
        </div>

        {/* 레벨 리스트 */}
        <ul className="mt-6 flex flex-col gap-3">
          {LEVELS.map(({ step, title, desc }) => {
            const isActive = selected === step;
            return (
              <li key={step}>
                <button
                  type="button"
                  onClick={() => setSelected(step)}
                  aria-pressed={isActive}
                  className={cn(
                    'flex w-full items-center gap-4 rounded-2xl bg-white px-4 py-4 text-left shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-shadow',
                    isActive && 'ring-coral ring-2',
                  )}
                >
                  <span className="bg-primary flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white">
                    {step}
                  </span>
                  <span className="flex flex-1 flex-col">
                    <span className="text-plum text-base font-bold">{title}</span>
                    <span className="text-primary/60 text-xs font-medium">{desc}</span>
                  </span>
                  <span className={cn('text-lg', isActive ? 'text-coral' : 'text-primary/30')}>
                    {isActive ? '✓' : '›'}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* CTA */}
        <div className="mt-auto mb-10 flex flex-col gap-3 pt-6">
          <Button
            variant="secondary"
            isFullWidth
            disabled={isSaving}
            onClick={() => router.push(ROUTES.LEVEL_TEST)}
          >
            간단 테스트로 추천받기
          </Button>
          <Button variant="primary" isFullWidth isLoading={isSaving} onClick={handleComplete}>
            선택 완료하고 홈으로
          </Button>
        </div>
      </div>

      <Toast
        isOpen={errorMessage !== null}
        message={errorMessage ?? ''}
        variant="error"
        onClose={() => setErrorMessage(null)}
      />
    </div>
  );
}
