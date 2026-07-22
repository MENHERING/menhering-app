'use client';

import { useEffect, useState } from 'react';

import type { Provider } from '@supabase/supabase-js';

import { createClient } from '@/lib/supabase/client';

interface SocialLoginButtonsProps {
  kakaoLabel: string;
  googleLabel: string;
  // 로그인 성공 후 이동 경로 (콜백 라우트가 세션 확립 뒤 redirect)
  next?: string;
}

export function SocialLoginButtons({
  kakaoLabel,
  googleLabel,
  next = '/home',
}: SocialLoginButtonsProps) {
  const [pending, setPending] = useState<Provider | null>(null);

  // provider 페이지로 이탈하면 이 페이지는 bfcache에 얼어붙은 채(=pending 유지) 저장된다.
  // 동의 화면에서 뒤로가기로 복원되면 버튼이 계속 비활성으로 보이므로, bfcache 복원 시 pending을 푼다.
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) setPending(null);
    };

    window.addEventListener('pageshow', handlePageShow);

    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  // 카카오는 Supabase 소셜 흐름을 쓰지 않고 자체 OIDC 라우트로 보낸다. (사유: lib/auth/kakao.ts)
  const handleKakaoLogin = () => {
    setPending('kakao');
    window.location.href = `/auth/kakao/start?next=${encodeURIComponent(next)}`;
  };

  const handleGoogleLogin = async () => {
    setPending('google');

    // 정상 흐름에선 provider 페이지로 리다이렉트되어 아래 에러 처리는 실행되지 않는다.
    // 실패 시에만 도달 → pending을 해제해 버튼이 비활성으로 고착되지 않게 한다.
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });

      if (error) {
        console.error('소셜 로그인 실패:', error.message);
        setPending(null);
      }
    } catch (error) {
      console.error('소셜 로그인 실패:', error);
      setPending(null);
    }
  };

  const isPending = pending !== null;

  return (
    <>
      <button
        type="button"
        onClick={handleKakaoLogin}
        disabled={isPending}
        className="flex h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#FEE500] text-base font-bold text-[#191600] transition-opacity hover:opacity-90 active:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <KakaoIcon />
        {kakaoLabel}
      </button>

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isPending}
        className="flex h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white text-base font-bold text-[#191600] transition-opacity hover:opacity-90 active:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <GoogleIcon />
        {googleLabel}
      </button>
    </>
  );
}

function KakaoIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" aria-hidden fill="#191600">
      <path d="M12 3.5C6.9 3.5 2.75 6.79 2.75 10.85c0 2.63 1.74 4.94 4.36 6.26-.19.69-.69 2.5-.79 2.89-.12.48.18.47.37.34.15-.1 2.36-1.6 3.32-2.26.65.1 1.31.15 1.99.15 5.1 0 9.25-3.29 9.25-7.35S17.1 3.5 12 3.5Z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}
