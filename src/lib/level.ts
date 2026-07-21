const XP_PER_LEVEL = 500;

export interface LevelInfo {
  level: number;
  currentXp: number;
  targetXp: number;
}

// 레벨업 공식: xp 500당 1레벨 고정.
export function getLevelInfo(xp: number): LevelInfo {
  return {
    level: Math.floor(xp / XP_PER_LEVEL) + 1,
    currentXp: xp % XP_PER_LEVEL,
    targetXp: XP_PER_LEVEL,
  };
}
