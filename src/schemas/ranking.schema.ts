import { z } from 'zod';

import { CHARACTER_TYPES, COLOR_THEME_VALUES } from '@/constants/avatar';

// GET /api/friends/ranking DTO. 아바타 미생성 유저는 라우트가 기본 캐릭터/테마로 채워 넣으므로
// characterType/colorTheme는 항상 유효한 값이다(CharacterRenderer가 non-null을 요구).
export const RankingEntrySchema = z.object({
  rank: z.number().int().positive(),
  userId: z.uuid(),
  nickname: z.string(),
  characterType: z.enum(CHARACTER_TYPES),
  colorTheme: z.enum(COLOR_THEME_VALUES),
  xp: z.number().int(),
  // 다른 사람: "3일 전 접속" 등 마지막 접속 정보. 본인 행에는 없다(streakDays로 대신 표시).
  lastActiveLabel: z.string().optional(),
  // 본인: 연속 학습일수(스트릭). 다른 사람 행에는 없다.
  streakDays: z.number().int().optional(),
  isMe: z.boolean(),
});

export const RankingEntryListSchema = z.array(RankingEntrySchema);

export type RankingEntry = z.infer<typeof RankingEntrySchema>;
