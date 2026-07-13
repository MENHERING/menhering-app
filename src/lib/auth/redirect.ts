// 인증 콜백 라우트가 공유하는 리다이렉트 유틸.

// 배포 환경은 프록시 뒤라 x-forwarded-host를 우선한다.
export function getBaseUrl(request: Request): string {
  const { origin } = new URL(request.url);
  const forwardedHost = request.headers.get('x-forwarded-host');
  const isLocalEnv = process.env.NODE_ENV === 'development';

  if (isLocalEnv || !forwardedHost) return origin;

  return `https://${forwardedHost}`;
}

const DEFAULT_NEXT_PATH = '/home';

// 경로 검증 전용 기준 origin. 실제 요청 origin과 무관하며, 파싱 결과가 이 origin을
// 벗어나는지(= 호스트가 바뀌는지)만 판별하는 데 쓴다.
const VALIDATION_ORIGIN = 'http://localhost';

// 오픈 리다이렉트 방지: 같은 사이트의 절대 경로만 허용한다.
// 문자 검사(`//` 차단)만으로는 부족하다. URL 파서는 상대 경로에서 `\`를 `/`로 취급하므로
// `/\evil.com`이 `//evil.com`과 같이 호스트를 바꾼다. 파서에 그대로 태워 origin이
// 유지되는 경우만 통과시키고, 정규화된 경로만 돌려준다.
export function sanitizeNextPath(next: string | undefined | null): string {
  if (!next || !next.startsWith('/')) return DEFAULT_NEXT_PATH;

  try {
    const url = new URL(next, VALIDATION_ORIGIN);

    if (url.origin !== VALIDATION_ORIGIN) return DEFAULT_NEXT_PATH;

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return DEFAULT_NEXT_PATH;
  }
}
