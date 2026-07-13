import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// 요청마다 Supabase 세션 쿠키를 갱신한다.
// @supabase/ssr 표준 패턴: getUser() 호출로 만료 임박 토큰을 자동 리프레시하고,
// 갱신된 쿠키를 요청/응답 양쪽에 반영한다.
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // 반드시 호출 — 세션 리프레시 트리거(생략 시 사용자가 임의로 로그아웃될 수 있음).
  await supabase.auth.getUser();

  return supabaseResponse;
}
