'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { SplashScreen } from '@/components/intro/SplashScreen';

// 스플래시 노출 시간(ms)
const SPLASH_DURATION_MS = 2000;

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      // replace: 뒤로가기 시 스플래시로 되돌아가지 않도록 함.
      router.replace('/login');
    }, SPLASH_DURATION_MS);

    return () => clearTimeout(timer);
  }, [router]);

  return <SplashScreen />;
}
