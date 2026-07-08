import type { CharacterType, ColorTheme } from '@/types/avatar';

export type RankingPeriod = 'week' | 'all';

export interface RankingEntry {
  rank: number;
  userId: string;
  nickname: string;
  characterType: CharacterType;
  colorTheme: ColorTheme;
  xp: number;
  // 다른 사람: "3일 전 접속" 등 마지막 접속 정보.
  lastActiveLabel?: string;
  // 본인: 연속 학습일수(스트릭). lastActiveLabel 대신 표시.
  streakDays?: number;
  isMe?: boolean;
}
