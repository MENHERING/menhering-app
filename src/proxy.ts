import { NextResponse, type NextRequest } from 'next/server';

import { updateSession } from '@/lib/supabase/middleware';

// 세션 갱신 + 라우트 가드. (Next 16: 구 middleware 컨벤션 → proxy)

// 로그인 없이 접근할 수 있는 경로.
// TODO: 공개 경로 추가 시 여기에 등록
const PUBLIC_PATHS = new Set(['/', '/login']);

// OAuth 콜백은 세션을 "만드는" 경로라 도착 시점엔 아직 미인증 상태다.
// 공개로 두지 않으면 가드가 /login으로 되돌려 로그인이 영영 완료되지 않는다.
const PUBLIC_PREFIXES = ['/auth', '/api/health'];

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
  const { supabaseResponse, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  if (!user && !isPublicPath(pathname)) {
    // 원래 요청의 쿼리가 로그인 URL로 새어나가지 않도록, 경로만 바꾸고 쿼리는 비운다.
    const loginUrl = new URL('/login', request.nextUrl.origin);
    // 로그인 후 원래 가려던 경로로 되돌려보내기 위해 보관한다. (쿼리스트링까지 함께)
    loginUrl.searchParams.set('next', `${pathname}${request.nextUrl.search}`);

    return withSessionCookies(supabaseResponse, NextResponse.redirect(loginUrl));
  }

  return supabaseResponse;
}

export const config = {
  // 정적 자산·이미지 최적화 경로는 제외(세션 갱신·가드 불필요).
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
