import { NextResponse } from 'next/server';

import { getBaseUrl, sanitizeNextPath } from '@/lib/auth/redirect';
import { createClient } from '@/lib/supabase/server';

// Supabase 소셜 로그인(구글) 콜백. 인가 코드를 세션으로 교환한 뒤 next 경로로 이동한다.
// 카카오는 별도 OIDC 흐름을 쓴다. (app/auth/kakao/, 사유는 lib/auth/kakao.ts)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const next = sanitizeNextPath(searchParams.get('next'));
  const baseUrl = getBaseUrl(request);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${baseUrl}${next}`);
    }

    console.error('소셜 로그인 세션 교환 실패:', error.message);
  }

  return NextResponse.redirect(`${baseUrl}/login?error=auth`);
}
