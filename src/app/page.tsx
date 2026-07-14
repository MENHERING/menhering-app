import { SplashScreen } from '@/components/intro/SplashScreen';
import { resolveEntryPath } from '@/lib/onboarding/queries';

// 스플래시는 브랜드를 잠깐 보여주는 화면이라, 어디로 갈지는 서버에서 미리 정해 내려보낸다.
// (세션 없음 → 로그인 / 레벨 없음 → 온보딩 / 그 외 → 홈)
export default async function Page() {
  const nextPath = await resolveEntryPath();

  return <SplashScreen nextPath={nextPath} />;
}
