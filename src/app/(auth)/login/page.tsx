import { redirect } from 'next/navigation';

import { LoginScreen } from '@/components/intro/LoginScreen';
import { getLoginErrorMessage } from '@/constants/auth';
import { sanitizeNextPath } from '@/lib/auth/redirect';
import { getOnboardingStatus, toEntryPath } from '@/lib/onboarding/queries';

// 보호 경로 접근 시 proxy가 ?next=<원래 경로>를 붙여 이 화면으로 보낸다.
// OAuth 콜백 실패 시에는 ?error=<code>가 붙어 실패 사유를 안내한다.
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const nextPath = sanitizeNextPath(next);
  const onboarding = await getOnboardingStatus();

  // 세션이 살아 있는데 로그인 화면을 다시 띄우지 않는다. 온보딩 여부에 따라 홈/온보딩으로 보낸다.
  if (onboarding.status !== 'unauthenticated') {
    redirect(toEntryPath(onboarding, nextPath));
  }

  return <LoginScreen variant="new" next={nextPath} errorMessage={getLoginErrorMessage(error)} />;
}
