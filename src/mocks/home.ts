// 홈 화면 퍼블리싱용 목 데이터. 실제 값은 추후 Supabase(user_progress/settings)에서 조회 교체.
export interface HomeSummary {
  greeting: string;
  // 마지막 접속 진행 바 - 오늘 기준 며칠째인지 / 최대 표시 일수
  accessStreak: number;
  accessStreakMax: number;
  // 현재 스테이지 및 다음 레벨까지 XP
  stage: number;
  xp: number;
  xpForNextLevel: number;
  // 하단 스탯 3종
  todayCompleted: number;
  learnStreak: number;
  accuracyPercent: number;
}

export const HOME_SUMMARY: HomeSummary = {
  greeting: '오늘도 같이 달려보자!',
  accessStreak: 1,
  accessStreakMax: 7,
  stage: 3,
  xp: 340,
  xpForNextLevel: 500,
  todayCompleted: 7,
  learnStreak: 4,
  accuracyPercent: 87,
};
