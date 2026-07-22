// 홈 화면 표시 기준값. DB에 없는 값(바 최대치·집계 기간)이라 상수로 둔다.
// 레벨업 기준치(500 XP/레벨)는 lib/level.ts의 getLevelInfo가 단일 소스라 여기서 관리하지 않는다.

// 마지막 접속 진행 바의 최대 표시 일수.
export const ACCESS_STREAK_MAX_DAYS = 7;

// 정답률·오늘 완료 집계 기간. 전체 세션을 다 읽지 않도록 최근 구간으로 제한한다.
export const STATS_WINDOW_DAYS = 90;

export const HOME_GREETING = '오늘도 같이 달려보자!';
