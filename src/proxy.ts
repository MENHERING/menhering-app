import { type NextRequest, NextResponse } from 'next/server';

import { updateSession } from './lib/supabase/middleware';
// TODO: 공개 경로 추가시 설정 추가
const PUBLIC_PATHS = new Set(['/', '/login']);
// TODO: 공개 접두사 추가시 설정 추가
const PUBLIC_PREFIXES = ['/api/health'];

function isPublicPath(path: string) {
  return PUBLIC_PATHS.has(path) || PUBLIC_PREFIXES.some((prefix) => path.startsWith(prefix));
}

function withSessionCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach(({ name, value, httpOnly, maxAge, priority }) => {
    to.cookies.set(name, value, { httpOnly, maxAge, priority });
  });
  return to;
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { supabaseResponse, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  if (!user && !isPublicPath(pathname)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('next', pathname);

    return withSessionCookies(supabaseResponse, NextResponse.redirect(loginUrl));
  }

  return supabaseResponse;
}

export const config = {
  // 정적 이미지는 제외
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
