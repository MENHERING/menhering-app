import { createClient } from '@supabase/supabase-js';

// service_role 키로 RLS를 우회하는 서버 전용 클라이언트. 쿠키 세션이 없는 컨텍스트(cron 발송 등)에서
// 전체 유저 데이터를 다뤄야 할 때만 쓴다 — 일반 요청 처리(로그인 사용자 컨텍스트)는 server.ts를 쓴다.
export function createServiceClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
}
