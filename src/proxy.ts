import { NextResponse, type NextRequest } from 'next/server';

import { updateSession } from '@/lib/supabase/middleware';

// 세션 갱신 + 라우트 가드. (Next 16: 구 middleware 컨벤션 → proxy)

// 로그인 없이 접근할 수 있는 경로.
// TODO: 공개 경로 추가 시 여기에 등록
// /~offline: 서비스워커가 오프라인 폴백으로 미리 캐싱해두는 페이지라, 비로그인 상태에서
// 캐싱되면 이 페이지가 아니라 /login 리다이렉트가 캐싱되어버린다.
// /api/push/reminder: Vercel Cron이 유저 세션 없이 호출한다. 인증은 라우트 내부의
// CRON_SECRET 검증이 담당하므로, 세션 가드 대상에서는 빼야 한다(안 빼면 항상 /login으로 리다이렉트됨).
const PUBLIC_PATHS = new Set([
  '/',
  '/login',
  '/~offline',
  '/manifest.webmanifest',
  '/api/push/reminder',
]);

// OAuth 콜백은 세션을 "만드는" 경로라 도착 시점엔 아직 미인증 상태다.
// 공개로 두지 않으면 가드가 /login으로 되돌려 로그인이 영영 완료되지 않는다.
// /serwist: 서비스워커 스크립트 서빙 경로. 비로그인 상태에서도 등록·갱신되어야 한다.
const PUBLIC_PREFIXES = ['/auth', '/api/health', '/serwist'];

function isPublicPath(pathname: string) {
  return (
    PUBLIC_PATHS.has(pathname) || PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  );
}

// 리다이렉트 응답에도 갱신된 세션 쿠키를 넘긴다.
// path·sameSite·secure 등이 빠지면 쿠키가 의도와 다르게 설정되므로 옵션째로 옮긴다.
function withSessionCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => to.cookies.set(cookie));

  return to;
}

export async function proxy(request: NextRequest) {
  const { supabaseResponse, user, authCheckFailed } = await updateSession(request);
  const { pathname } = request.nextUrl;

  // authCheckFailed(네트워크 오류로 인증 확인 자체가 실패)면 로그인으로 튕기지 않고 통과시킨다.
  // 일시적 Supabase 도달 실패가 로그인 유저를 로그아웃시키거나 Server Action을 깨는 것을 막는다.
  // 실제 데이터 접근은 RLS가 보호하므로 통과시켜도 안전하다.
  if (!user && !authCheckFailed && !isPublicPath(pathname)) {
    // 원래 요청의 쿼리가 로그인 URL로 새어나가지 않도록, 경로만 바꾸고 쿼리는 비운다.
    const loginUrl = new URL('/login', request.nextUrl.origin);
    // 로그인 후 원래 가려던 경로로 되돌려보내기 위해 보관한다. (쿼리스트링까지 함께)
    loginUrl.searchParams.set('next', `${pathname}${request.nextUrl.search}`);

    return withSessionCookies(supabaseResponse, NextResponse.redirect(loginUrl));
  }

  return supabaseResponse;
}

export const config = {
  // 정적 자산은 세션 갱신·가드가 불필요하므로 제외한다. 제외하지 않으면 정적 파일 요청마다
  // getUser()(네트워크)가 붙어, 특히 Live2D 에셋(model3.json/moc3/텍스처)이 매번 세션 확인에 막힌다.
  // - _next/static·_next/image·favicon, public/live2d/** 경로
  // - 정적 확장자(이미지·폰트·오디오·Live2D json/moc3 등)
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|live2d/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json|moc3|moc|woff2?|ttf|otf|mp3|wav|m4a)$).*)',
  ],
};
