// 환경변수 타입 정의. .env* 에 변수를 추가하면 여기에도 추가하세요.
namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: string;

    // 서버 전용 (클라이언트 노출 금지)
    SUPABASE_SERVICE_ROLE_KEY: string;
  }
}
