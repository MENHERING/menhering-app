import { redirect } from 'next/navigation';

import { LevelSelectScreen } from '@/components/intro/LevelSelectScreen';
import { ROUTES } from '@/constants/routes';
import { getOnboardingStatus } from '@/lib/onboarding/queries';

// 레벨은 최초 1회만 설정한다. 이미 정한 유저가 다시 들어오면 홈으로 돌려보낸다.
// 조회 실패(unknown)는 세션이 있는 상태이므로 온보딩을 그대로 진행시킨다.
// (로그인 화면으로 보내봤자 다시 이 화면으로 돌아온다. 저장이 함께 실패하면 화면에서 에러로 안내한다.)
export default async function LevelPage() {
  const onboarding = await getOnboardingStatus();

  if (onboarding.status === 'unauthenticated') redirect(ROUTES.LOGIN);
  if (onboarding.status === 'completed') redirect(ROUTES.HOME);

  return <LevelSelectScreen />;
}
