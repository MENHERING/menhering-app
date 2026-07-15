const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const WEEK_MS = 7 * DAY_MS;

// createdAt(ISO datetime) -> 'n일 전' 형식 문자열: 렌더링 시점에 계산
export function formatRelativeTime(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();

  if (diffMs < MINUTE_MS) return '방금 전';
  if (diffMs < HOUR_MS) return `${Math.floor(diffMs / MINUTE_MS)}분 전`;
  if (diffMs < DAY_MS) return `${Math.floor(diffMs / HOUR_MS)}시간 전`;
  if (diffMs < WEEK_MS) return `${Math.floor(diffMs / DAY_MS)}일 전`;

  return `${Math.floor(diffMs / WEEK_MS)}주 전`;
}
