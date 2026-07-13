import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import {
  KAKAO_NEXT_COOKIE,
  KAKAO_NONCE_COOKIE,
  KAKAO_STATE_COOKIE,
  KAKAO_TOKEN_URL,
  getKakaoRedirectUri,
} from '@/lib/auth/kakao';
import { getBaseUrl, sanitizeNextPath } from '@/lib/auth/redirect';
import { createClient } from '@/lib/supabase/server';

interface KakaoTokenResponse {
  id_token?: string;
  access_token?: string;
}

// 카카오 OIDC 콜백. state 대조 → 인가 코드를 id_token으로 교환 → Supabase 세션 확립.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  const cookieStore = await cookies();
  const storedState = cookieStore.get(KAKAO_STATE_COOKIE)?.value;
  const nonce = cookieStore.get(KAKAO_NONCE_COOKIE)?.value;
  const next = sanitizeNextPath(cookieStore.get(KAKAO_NEXT_COOKIE)?.value);

  // 일회성 값이므로 성공/실패와 무관하게 즉시 폐기.
  cookieStore.delete(KAKAO_STATE_COOKIE);
  cookieStore.delete(KAKAO_NONCE_COOKIE);
  cookieStore.delete(KAKAO_NEXT_COOKIE);

  const baseUrl = getBaseUrl(request);
  const failureUrl = `${baseUrl}/login?error=auth`;

  if (!code || !state || !storedState || state !== storedState || !nonce) {
    return NextResponse.redirect(failureUrl);
  }

  const tokenResponse = await fetch(KAKAO_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.KAKAO_REST_API_KEY,
      client_secret: process.env.KAKAO_CLIENT_SECRET,
      redirect_uri: getKakaoRedirectUri(request),
      code,
    }),
  });

  if (!tokenResponse.ok) {
    console.error('카카오 토큰 교환 실패:', tokenResponse.status);
    return NextResponse.redirect(failureUrl);
  }

  const { id_token: idToken, access_token: accessToken }: KakaoTokenResponse =
    await tokenResponse.json();

  if (!idToken) {
    console.error('카카오 응답에 id_token 없음 (OpenID Connect 활성화 여부 확인)');
    return NextResponse.redirect(failureUrl);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithIdToken({
    provider: 'kakao',
    token: idToken,
    // 카카오 id_token의 at_hash 검증에 필요.
    access_token: accessToken,
    nonce,
  });

  if (error) {
    console.error('Supabase 카카오 로그인 실패:', {
      name: error.name,
      status: error.status,
      code: error.code,
      message: error.message,
    });
    return NextResponse.redirect(failureUrl);
  }

  return NextResponse.redirect(`${baseUrl}${next}`);
}
