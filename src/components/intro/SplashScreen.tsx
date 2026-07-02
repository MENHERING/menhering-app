import Image from 'next/image';

// PWA 최초 진입 스플래시 (brief 1.1)
// 로딩 중 표시 — 실제 인증 분기는 추후 page.tsx에서 처리
export function SplashScreen() {
  return (
    <div className="bg-sand relative flex min-h-dvh w-full flex-col items-center overflow-hidden px-6">
      <div className="flex w-full max-w-107.5 flex-1 flex-col items-center justify-center gap-10">
        {/* 브랜드 */}
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-plum text-4xl font-extrabold tracking-tight">멘헤링</h1>
          <p className="text-primary text-sm font-medium">나만의 캐릭터와 함께하는 학습</p>
        </div>

        {/* 마스코트 */}
        <div className="relative h-56 w-56">
          <Image
            src="/mascot/red-panda.png"
            alt="멘헤링 마스코트"
            fill
            priority
            sizes="224px"
            className="object-contain drop-shadow-sm"
          />
        </div>
      </div>

      {/* 로딩 */}
      <div className="mb-16 flex flex-col items-center gap-4">
        <p className="text-primary/80 text-sm font-medium">오늘의 학습을 준비하고 있어요</p>
        <div className="flex items-center gap-2">
          <span className="bg-primary-soft size-2 animate-bounce rounded-full [animation-delay:-0.3s]" />
          <span className="bg-primary-soft size-2 animate-bounce rounded-full [animation-delay:-0.15s]" />
          <span className="bg-primary size-2 animate-bounce rounded-full" />
        </div>
      </div>
    </div>
  );
}
