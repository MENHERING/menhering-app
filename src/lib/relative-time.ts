// ISO 시각 → "방금 전 / N분 전 / N시간 전 / N일 전 / N주 전" 한국어 상대 시간.
// 알림 목록처럼 절대 시각보다 감각적 표현이 나은 곳에서 쓴다.
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

export function formatRelativeTime(iso: string, now: number = Date.now()): string {
  // 미래 시각(음수 diff)도 MINUTE 미만 분기에서 '방금 전'으로 안전하게 흡수된다.
  const diff = now - new Date(iso).getTime();

  if (diff < MINUTE) return '방금 전';
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}분 전`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}시간 전`;
  if (diff < WEEK) return `${Math.floor(diff / DAY)}일 전`;

  return `${Math.floor(diff / WEEK)}주 전`;
}
