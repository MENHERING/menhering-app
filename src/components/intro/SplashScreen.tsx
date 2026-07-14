'use client';

import { useEffect } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

// 브랜드 노출 시간(ms)
const SPLASH_DURATION_MS = 2000;

interface SplashScreenProps {
  // 노출이 끝난 뒤 이동할 경로 (서버에서 세션·레벨 상태로 결정)
  nextPath: string;
}

export function SplashScreen({ nextPath }: SplashScreenProps) {
  const router = useRouter();

  useEffect(() => {
    // replace: 뒤로가기로 스플래시에 되돌아오지 않도록 한다.
    const timer = setTimeout(() => router.replace(nextPath), SPLASH_DURATION_MS);

    return () => clearTimeout(timer);
  }, [router, nextPath]);

  return (
    <div className="bg-sand relative flex min-h-dvh w-full flex-col items-center overflow-hidden px-6">
      <div className="flex w-full max-w-[430px] flex-1 flex-col items-center justify-center gap-10">
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
