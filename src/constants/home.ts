// 홈 화면 표시 기준값. DB에 없는 값(레벨업 기준치·바 최대치)이라 상수로 둔다.

// 다음 레벨까지 필요한 XP. TODO: 레벨업 공식이 정해지면 교체.
export const XP_FOR_NEXT_LEVEL = 500;

// 마지막 접속 진행 바의 최대 표시 일수.
export const ACCESS_STREAK_MAX_DAYS = 7;

// 정답률·오늘 완료 집계 기간. 전체 세션을 다 읽지 않도록 최근 구간으로 제한한다.
export const STATS_WINDOW_DAYS = 90;

export const HOME_GREETING = '오늘도 같이 달려보자!';
