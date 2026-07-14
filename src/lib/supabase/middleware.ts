import { createServerClient } from '@supabase/ssr';
import { isAuthRetryableFetchError } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

interface UpdateSessionResult {
  supabaseResponse: NextResponse;
  // getClaims()로 로컬 검증한 JWT 클레임(로그인 유저면 존재). 인증 여부 판별에만 쓴다.
  user: object | null;
  // getClaims()가 "네트워크성(재시도 가능)" 오류로 실패해 인증 여부를 확정하지 못한 경우만 true.
  // (user=null이 "미로그인"인지 "확인 실패"인지 구분해, 일시적 장애로 로그인 유저를 튕기지 않게 한다.)
  // 위조·만료 JWT나 폐기된 토큰은 "확인 실패"가 아니라 "미인증"이므로 false로 둔다(fail-open 대상 아님).
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

    // getClaims()는 네트워크/HTTP 실패뿐 아니라 위조·만료 JWT, 폐기된 refresh token도 error로 돌려준다.
    // 재시도 가능한(네트워크성) 오류만 fail-open으로 두고, 토큰 오류는 미인증으로 확정한다 —
    // 그러지 않으면 아무 문자열이나 담은 쿠키가 proxy 가드를 통과하는 인증 우회가 생긴다.
    if (error) {
      if (!isAuthRetryableFetchError(error)) {
        return { supabaseResponse, user: null, authCheckFailed: false };
      }

      console.error('Supabase 세션 확인 실패(네트워크):', error);

      return { supabaseResponse, user: null, authCheckFailed: true };
    }

    return { supabaseResponse, user: data?.claims ?? null, authCheckFailed: false };
  } catch (error) {
    // 예외도 같은 기준으로 나눈다: 네트워크성(재시도 가능)만 확인 실패(fail-open)로 두고,
    // 그 외는 미인증으로 확정한다.
    const authCheckFailed = isAuthRetryableFetchError(error);

    console.error(
      authCheckFailed ? 'Supabase 세션 확인 예외(네트워크):' : 'Supabase 세션 확인 예외:',
      error,
    );

    return { supabaseResponse, user: null, authCheckFailed };
  }
}
