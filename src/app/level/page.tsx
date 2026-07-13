import { redirect } from 'next/navigation';

import { LevelSelectScreen } from '@/components/intro/LevelSelectScreen';
import { ROUTES } from '@/constants/routes';
import { getOnboardingStatus } from '@/lib/onboarding/queries';

// 레벨은 최초 1회만 설정한다. 이미 정한 유저가 다시 들어오면 홈으로 돌려보낸다.
export default async function LevelPage() {
  const onboarding = await getOnboardingStatus();

  if (onboarding.status === 'completed') redirect(ROUTES.HOME);

  return <LevelSelectScreen />;
}
