import { LoginScreen } from '@/components/intro/LoginScreen';
import { sanitizeNextPath } from '@/lib/auth/redirect';

// 보호 경로 접근 시 proxy가 ?next=<원래 경로>를 붙여 이 화면으로 보낸다.
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return <LoginScreen variant="new" next={sanitizeNextPath(next)} />;
}
