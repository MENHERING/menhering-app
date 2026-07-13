import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import {
  KAKAO_AUTHORIZE_URL,
  KAKAO_COOKIE_OPTIONS,
  KAKAO_NEXT_COOKIE,
  KAKAO_NONCE_COOKIE,
  KAKAO_SCOPE,
  KAKAO_STATE_COOKIE,
  getKakaoCredentials,
  getKakaoRedirectUri,
  hashNonce,
} from '@/lib/auth/kakao';
import { getBaseUrl, sanitizeNextPath } from '@/lib/auth/redirect';

// 카카오 OIDC 인가 요청 시작점. state/nonce를 발급해 쿠키에 저장하고 카카오 동의 화면으로 보낸다.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const next = sanitizeNextPath(searchParams.get('next'));

  const credentials = getKakaoCredentials();

  if (!credentials) {
    console.error('카카오 환경변수(KAKAO_REST_API_KEY, KAKAO_CLIENT_SECRET) 미설정');
    return NextResponse.redirect(`${getBaseUrl(request)}/login?error=auth`);
  }

  // state: CSRF 방지(콜백에서 대조), nonce: id_token 재사용 방지(Supabase 검증에 사용)
  const state = crypto.randomUUID();
  const nonce = crypto.randomUUID();

  const cookieStore = await cookies();
  cookieStore.set(KAKAO_STATE_COOKIE, state, KAKAO_COOKIE_OPTIONS);
  // 콜백에서 signInWithIdToken에 넘길 원본 nonce를 보관한다. (카카오에는 해시값을 보냄)
  cookieStore.set(KAKAO_NONCE_COOKIE, nonce, KAKAO_COOKIE_OPTIONS);
  cookieStore.set(KAKAO_NEXT_COOKIE, next, KAKAO_COOKIE_OPTIONS);

  const authorizeUrl = new URL(KAKAO_AUTHORIZE_URL);
  authorizeUrl.searchParams.set('client_id', credentials.restApiKey);
  authorizeUrl.searchParams.set('redirect_uri', getKakaoRedirectUri(request));
  authorizeUrl.searchParams.set('response_type', 'code');
  authorizeUrl.searchParams.set('scope', KAKAO_SCOPE);
  authorizeUrl.searchParams.set('state', state);
  authorizeUrl.searchParams.set('nonce', await hashNonce(nonce));

  return NextResponse.redirect(authorizeUrl);
}
