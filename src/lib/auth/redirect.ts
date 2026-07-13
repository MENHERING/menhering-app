// 인증 콜백 라우트가 공유하는 리다이렉트 유틸.

// 배포 환경은 프록시 뒤라 x-forwarded-host를 우선한다.
export function getBaseUrl(request: Request): string {
  const { origin } = new URL(request.url);
  const forwardedHost = request.headers.get('x-forwarded-host');
  const isLocalEnv = process.env.NODE_ENV === 'development';

  if (isLocalEnv || !forwardedHost) return origin;

  return `https://${forwardedHost}`;
}

// 오픈 리다이렉트 방지: 같은 사이트의 절대 경로만 허용한다.
export function sanitizeNextPath(next: string | undefined | null): string {
  if (!next || !next.startsWith('/') || next.startsWith('//')) return '/home';

  return next;
}
