'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/common/Button';
import { Header } from '@/components/common/Header';
import { Toast } from '@/components/common/Toast';
import { LEVELS } from '@/constants/level';
import { ROUTES } from '@/constants/routes';
import { useSaveOnboardingLevel } from '@/hooks/onboarding/use-save-onboarding-level';
import { cn } from '@/lib/cn';

interface LevelResultScreenProps {
  // 채점 결과 추천 레벨 (기본 초급)
  recommendedStep?: number;
}

export function LevelResultScreen({ recommendedStep = 2 }: LevelResultScreenProps) {
  const router = useRouter();
  const level = LEVELS.find((l) => l.step === recommendedStep) ?? LEVELS[1];
  const { save, isSaving, errorMessage, clearError } = useSaveOnboardingLevel();

  const handleStart = () => save(level.step);

  return (
    <div className="bg-sand flex min-h-dvh w-full flex-col items-center">
      <Header title="테스트 결과" leftType="none" />
      <div className="flex w-full max-w-[430px] flex-1 flex-col px-6">
        <div className="relative mx-auto mt-8 h-40 w-40">
          {/* 뒷배경 장식 도트 */}
          <div className="bg-coral-soft/40 absolute inset-0 m-auto size-32 rounded-full blur-[2px]" />
          <Image
            src="/mascot/red-panda.png"
            alt="멘헤링 마스코트"
            fill
            sizes="160px"
            className="relative object-contain drop-shadow-sm"
          />
        </div>

        {/* 추천 레벨 */}
        <div className="mt-6 flex flex-col items-center gap-2">
          <span className="text-primary/70 text-sm font-medium">추천 시작 레벨</span>
          <span className="text-plum text-4xl font-extrabold">{level.title}</span>
          <p className="text-primary/70 mt-1 text-center text-sm leading-6 font-medium">
            {level.resultDesc}
          </p>
        </div>

        {/* 레벨 칩 */}
        <div className="mt-6 flex justify-center gap-2">
          {LEVELS.map(({ step, title }) => {
            const isActive = step === recommendedStep;
            return (
              <span
                key={step}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs font-bold',
                  isActive
                    ? 'border-coral bg-coral-soft/50 text-coral'
                    : 'border-cream text-primary/50 bg-white',
                )}
              >
                {title}
              </span>
            );
          })}
        </div>

        <div className="mt-6 rounded-2xl bg-white px-5 py-4 shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
          <p className="text-plum text-sm font-bold">최초 1회 설정</p>
          <p className="text-primary/60 mt-1 text-xs font-medium">
            이 레벨의 Stage 1부터 바로 시작합니다.
          </p>
        </div>

        <div className="mt-auto mb-10 flex flex-col gap-3 pt-6">
          <Button
            variant="secondary"
            isFullWidth
            disabled={isSaving}
            onClick={() => router.push(ROUTES.LEVEL)}
          >
            직접 다시 고르기
          </Button>
          <Button variant="primary" isFullWidth isLoading={isSaving} onClick={handleStart}>
            {level.title}으로 시작
          </Button>
        </div>
      </div>

      <Toast
        isOpen={errorMessage !== null}
        message={errorMessage ?? ''}
        variant="error"
        onClose={clearError}
      />
    </div>
  );
}
