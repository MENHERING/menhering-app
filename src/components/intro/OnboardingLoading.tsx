import { Spinner } from '@/components/common/Spinner';

// 온보딩 화면(레벨 선택/실력테스트 결과)이 서버에서 온보딩 상태를 조회하는 동안 보여줄 폴백.
// 조회가 끝나기 전 빈 화면이 잠깐 노출되는 것을 막는다.
export function OnboardingLoading() {
  return (
    <div className="bg-sand flex min-h-dvh w-full flex-col items-center justify-center px-6">
      <div className="text-coral flex flex-col items-center gap-3">
        <Spinner />
        <p className="text-primary/70 text-sm font-medium">잠시만 기다려주세요…</p>
      </div>
    </div>
  );
}
