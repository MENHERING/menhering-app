import { getBaseUrl } from '@/lib/auth/redirect';

// 카카오 OIDC 로그인 공통 상수/유틸.
//
// Supabase의 카카오 소셜 provider는 account_email scope를 강제로 요청하는데,
// 카카오는 이메일 동의항목을 Biz App(심사)에서만 허용한다(KOE205).
// 그래서 카카오만 OIDC 흐름을 직접 구현해 필요한 scope(openid, profile_nickname)만 요청하고,
// 발급받은 id_token으로 supabase.auth.signInWithIdToken을 호출해 세션을 만든다.

export const KAKAO_AUTHORIZE_URL = 'https://kauth.kakao.com/oauth/authorize';
export const KAKAO_TOKEN_URL = 'https://kauth.kakao.com/oauth/token';

// openid: id_token 발급 / profile_nickname: 닉네임. (이메일·프로필 사진은 요청하지 않음)
export const KAKAO_SCOPE = 'openid profile_nickname';

export const KAKAO_STATE_COOKIE = 'kakao_oauth_state';
export const KAKAO_NONCE_COOKIE = 'kakao_oauth_nonce';
export const KAKAO_NEXT_COOKIE = 'kakao_oauth_next';

// 인가 요청~콜백 사이에만 유효하면 되는 일회성 쿠키.
export const KAKAO_COOKIE_MAX_AGE = 600;

// 토큰 교환 요청 제한 시간. 카카오 응답이 지연돼도 로그인 흐름이 멈추지 않게 한다.
export const KAKAO_TOKEN_TIMEOUT_MS = 5000;

export const KAKAO_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: KAKAO_COOKIE_MAX_AGE,
};

// 인가 요청과 토큰 교환에 넘기는 redirect_uri는 완전히 같아야 하므로 한 곳에서 만든다.
export function getKakaoRedirectUri(request: Request): string {
  return `${getBaseUrl(request)}/auth/kakao/callback`;
}

// Supabase(GoTrue)는 signInWithIdToken에 넘긴 nonce를 SHA-256으로 해시해서 id_token의 nonce 클레임과 비교한다.
// 따라서 인가 요청에는 해시값을, signInWithIdToken에는 원본을 넘겨야 한다. (Nonces mismatch 방지)
export async function hashNonce(nonce: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(nonce));

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}
