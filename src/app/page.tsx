'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { SplashScreen } from '@/components/intro/SplashScreen';

// 스플래시 노출 시간(ms)
const SPLASH_DURATION_MS = 2000;

// "/" 진입점 — 스플래시 표시 후 분기.
// TODO: Supabase 세션 확인 후 분기 (세션 없음 → /login, level 없음 → /level-test, 있음 → /home)
export default function Page() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      // replace: 뒤로가기 시 스플래시로 되돌아가지 않도록
      router.replace('/login');
    }, SPLASH_DURATION_MS);

    return () => clearTimeout(timer);
  }, [router]);

  return <SplashScreen />;
}
