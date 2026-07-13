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
  // 이 함수는 거의 모든 요청에서 실행되므로, Supabase 장애가 전체 페이지 500으로 번지지 않게 격리한다.
  // 실패해도 요청은 그대로 통과시키고, 세션 갱신만 이번 요청에서 생략된다.
  try {
    await supabase.auth.getUser();
  } catch (error) {
    console.error('Supabase 세션 갱신 실패:', error);
  }

  return supabaseResponse;
}
