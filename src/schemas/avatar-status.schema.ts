import { z } from 'zod';

import { MOODS } from '@/constants/avatar';

// 서버 avatar_status 응답. DB는 감정을 mood_value(0~100 수치)로만 저장하고,
// Mood 5단계 라벨은 route handler가 moodFromValue()로 가공해 함께 내려준다(프론트는 표시만).
// moodValue도 함께 주는 이유: 기분 링/게이지가 0~100 비율로 채우기 때문.
export const AvatarStatusSchema = z.object({
  moodValue: z.number().int().min(0).max(100),
  mood: z.enum(MOODS),
  updatedAt: z.iso.datetime(),
});

export type AvatarStatus = z.infer<typeof AvatarStatusSchema>;
