import { LoginScreen } from '@/components/intro/LoginScreen';

// 1.2 로그인 (brief 5-A)
// TODO: 신규/복귀 variant 분기 — 이전 로그인 이력(쿠키/세션) 기준으로 'returning' 전달
export default function LoginPage() {
  return <LoginScreen variant="new" />;
}
