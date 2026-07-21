const MS_PER_DAY = 86_400_000;
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

// KST 기준 해당 날 0시(UTC Date). reference 생략 시 오늘.
export function getKstDayStart(reference: Date = new Date()): Date {
  const inKst = reference.getTime() + KST_OFFSET_MS;
  const kstMidnight = Math.floor(inKst / MS_PER_DAY) * MS_PER_DAY;

  return new Date(kstMidnight - KST_OFFSET_MS);
}

//  KST 기준 해당 주 월요일 0시(UTC Date)
export function getKstWeekStart(reference: Date = new Date()): Date {
  const dayStart = getKstDayStart(reference);
  const dayOfWeek = new Date(dayStart.getTime() + KST_OFFSET_MS).getUTCDay();
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  return new Date(dayStart.getTime() - daysSinceMonday * MS_PER_DAY);
}

// KST 요일 라벨 (일~토, getUTCDay() 인덱스와 동일).
export const KST_WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const;

// KST 기준 요일 라벨 반환.
export function getKstWeekdayLabel(date: Date): (typeof KST_WEEKDAY_LABELS)[number] {
  const inKst = new Date(date.getTime() + KST_OFFSET_MS);

  return KST_WEEKDAY_LABELS[inKst.getUTCDay()];
}
