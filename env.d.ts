// 환경변수 타입 정의. .env* 에 변수를 추가하면 여기에도 추가하세요.
namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: string;

    // 서버 전용 (클라이언트 노출 금지)
    SUPABASE_SERVICE_ROLE_KEY: string;

    // 카카오 OIDC 로그인 (서버 전용)
    KAKAO_REST_API_KEY: string;
    KAKAO_CLIENT_SECRET: string;

    // 웹 푸시(VAPID). 공개키는 클라이언트 구독에, 비밀키·subject는 서버 발송에 쓴다.
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: string;
    VAPID_PRIVATE_KEY: string;
    // 연락처 URI (mailto: 또는 https:). web-push setVapidDetails 필수값.
    VAPID_SUBJECT: string;
  }
}
