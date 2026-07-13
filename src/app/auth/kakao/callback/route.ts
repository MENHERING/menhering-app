import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import {
  KAKAO_NEXT_COOKIE,
  KAKAO_NONCE_COOKIE,
  KAKAO_STATE_COOKIE,
  KAKAO_TOKEN_TIMEOUT_MS,
  KAKAO_TOKEN_URL,
  getKakaoCredentials,
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

  const credentials = getKakaoCredentials();

  if (!credentials) {
    console.error('카카오 환경변수(KAKAO_REST_API_KEY, KAKAO_CLIENT_SECRET) 미설정');
    return NextResponse.redirect(failureUrl);
  }

  let tokens: KakaoTokenResponse;

  try {
    const tokenResponse = await fetch(KAKAO_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: credentials.restApiKey,
        client_secret: credentials.clientSecret,
        redirect_uri: getKakaoRedirectUri(request),
        code,
      }),
      // 카카오 응답 지연 시 로그인 요청이 무한정 대기하지 않도록 제한한다.
      signal: AbortSignal.timeout(KAKAO_TOKEN_TIMEOUT_MS),
    });

    if (!tokenResponse.ok) {
      console.error('카카오 토큰 교환 실패:', tokenResponse.status);
      return NextResponse.redirect(failureUrl);
    }

    tokens = await tokenResponse.json();
  } catch (error) {
    // 네트워크 장애·타임아웃·JSON 파싱 실패 → 로그인 화면으로 되돌린다.
    console.error('카카오 토큰 요청 오류:', error);
    return NextResponse.redirect(failureUrl);
  }

  const { id_token: idToken, access_token: accessToken } = tokens;

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
