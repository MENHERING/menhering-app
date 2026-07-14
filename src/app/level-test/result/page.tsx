import { redirect } from 'next/navigation';

import { LevelResultScreen } from '@/components/intro/LevelResultScreen';
import { findLevelByStep } from '@/constants/level';
import { ROUTES } from '@/constants/routes';
import { getOnboardingStatus } from '@/lib/onboarding/queries';

// 온보딩 — 실력테스트 결과·추천 레벨 (step 쿼리로 전달받음)
export default async function LevelTestResultPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string }>;
}) {
  const onboarding = await getOnboardingStatus();

  // 레벨은 최초 1회만 설정한다(레벨 선택 화면과 동일 규칙).
  if (onboarding.status === 'unauthenticated') redirect(ROUTES.LOGIN);
  if (onboarding.status === 'completed') redirect(ROUTES.HOME);

  const { step } = await searchParams;
  const recommendedStep = findLevelByStep(Number(step))?.step;

  return <LevelResultScreen recommendedStep={recommendedStep} />;
}
