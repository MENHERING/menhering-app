import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

interface UpdateSessionResult {
  supabaseResponse: NextResponse;
  // getClaims()로 로컬 검증한 JWT 클레임(로그인 유저면 존재). 인증 여부 판별에만 쓴다.
  user: object | null;
  // getClaims()가 네트워크 오류 등으로 실패해 인증 여부를 "확정하지 못한" 경우 true.
  // (user=null이 "미로그인"인지 "확인 실패"인지 구분해, 일시적 장애로 로그인 유저를 튕기지 않게 한다.)
  authCheckFailed: boolean;
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

  // getClaims()는 JWT를 로컬에서 검증한다(서명키 기반) → getUser()처럼 매 요청 네트워크 왕복을 하지 않아
  // 훨씬 빠르다. 세션 리프레시(만료 토큰 갱신)도 함께 처리한다. 이 함수는 거의 모든 요청에서 실행되므로
  // Supabase 장애가 전체 페이지 500으로 번지지 않게 try/catch로 격리한다.
  // ⚠️ 로컬 검증은 프로젝트에 JWT 서명키(비대칭)가 켜져 있어야 한다. 안 켜져 있으면 getClaims가
  // 내부적으로 네트워크 검증(getUser)으로 폴백해 다시 느려진다 → Supabase 대시보드에서 서명키 활성화 필요.
  try {
    const { data, error } = await supabase.auth.getClaims();

    // supabase-js는 네트워크/HTTP 실패를 throw가 아니라 error 필드로 돌려주기도 한다.
    // 이 경우도 "인증 확인 실패"로 보고 fail-open 처리해야 로그인 유저가 튕기지 않는다.
    if (error) {
      console.error('Supabase 세션 확인 실패:', error);

      return { supabaseResponse, user: null, authCheckFailed: true };
    }

    return { supabaseResponse, user: data?.claims ?? null, authCheckFailed: false };
  } catch (error) {
    console.error('Supabase 세션 확인 예외:', error);

    // 예외로 인증 확인 실패. user는 null이지만 "미로그인"으로 단정하지 않는다.
    return { supabaseResponse, user: null, authCheckFailed: true };
  }
}
