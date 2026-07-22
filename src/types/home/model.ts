// 홈 화면 요약. user_progress(스테이지·XP·연속일)와 sessions(오늘 완료·정답률) 집계 결과다.
export interface HomeSummary {
  greeting: string;
  // 마지막 접속 진행 바 - 연속 학습일 / 최대 표시 일수
  accessStreak: number;
  accessStreakMax: number;
  // 현재 스테이지 및 누적 XP. 레벨·레벨 내 진행도는 화면에서 getLevelInfo(xp)로 파생한다.
  stage: number;
  xp: number;
  // 하단 스탯 3종
  todayCompleted: number;
  learnStreak: number;
  accuracyPercent: number;
}
