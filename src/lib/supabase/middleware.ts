import { createServerClient } from '@supabase/ssr';
import type { User } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

interface UpdateSessionResult {
  supabaseResponse: NextResponse;
  user: User | null;
}

// 요청마다 Supabase 세션 쿠키를 갱신하고, 라우트 가드가 쓸 사용자 정보를 함께 돌려준다.
// @supabase/ssr 표준 패턴: getUser() 호출로 만료 임박 토큰을 자동 리프레시하고,
// 갱신된 쿠키를 요청/응답 양쪽에 반영한다.
export async function updateSession(request: NextRequest): Promise<UpdateSessionResult> {
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

  // getUser() 호출이 세션 리프레시를 트리거한다(생략 시 사용자가 임의로 로그아웃될 수 있음).
  // 이 함수는 거의 모든 요청에서 실행되므로, Supabase 장애가 전체 페이지 500으로 번지지 않게 격리한다.
  // 실패 시 user는 null이 되어 보호 경로는 로그인 화면으로 유도된다(fail-closed).
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    return { supabaseResponse, user };
  } catch (error) {
    console.error('Supabase 세션 갱신 실패:', error);

    return { supabaseResponse, user: null };
  }
}
