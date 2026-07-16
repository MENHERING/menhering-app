import { z } from 'zod';

const MoodSchema = z.enum(['행복', '보통', '우울', '지침', '화남']);

// GET /mypage DTO. avatarUrl은 포함 X
export const ProfileSummarySchema = z.object({
  name: z.string(),
  difficulty: z.string(),
  stage: z.number().int().min(1),
  mood: MoodSchema,
  streakDays: z.number().int().min(0),
  currentXp: z.number().int().min(0),
  targetXp: z.number().int().min(1),
  level: z.number().int().min(1),
});

// GET /mypage DTO. "일"/"회"/"%" 같은 표시용 단위, 문구는 컴포넌트에서 조립 X
export const StatsSummarySchema = z.object({
  streakDays: z.number().int().min(0),
  completedProblems: z.number().int().min(0),
  totalSessions: z.number().int().min(0),
  totalXp: z.number().int().min(0),
  accuracyPercent: z.number().int().min(0).max(100),
});

export const ChartBarSchema = z.object({
  label: z.string(),
  value: z.number().int().min(0),
});

// GET /mypage
export const MyPageSummarySchema = z.object({
  profile: ProfileSummarySchema,
  stats: StatsSummarySchema,
  weeklyChart: z.array(ChartBarSchema),
  dailyChart: z.array(ChartBarSchema),
});

export type Mood = z.infer<typeof MoodSchema>;
export type ProfileSummary = z.infer<typeof ProfileSummarySchema>;
export type StatsSummary = z.infer<typeof StatsSummarySchema>;
export type ChartBarData = z.infer<typeof ChartBarSchema>;
export type MyPageSummary = z.infer<typeof MyPageSummarySchema>;
