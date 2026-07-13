import { type NextRequest } from 'next/server';

import { updateSession } from '@/lib/supabase/middleware';

// 모든 요청에서 Supabase 세션 쿠키를 갱신한다. (Next 16: 구 middleware 컨벤션 → proxy)
export function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // 정적 자산·이미지 최적화 경로는 제외(세션 갱신 불필요).
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
