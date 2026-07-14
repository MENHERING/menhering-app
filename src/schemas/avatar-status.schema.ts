import { z } from 'zod';

import { MOODS } from '@/constants/avatar';

// 서버 avatar_status 응답. DB는 감정을 mood_value(0~100 수치)로만 저장하고,
// Mood 5단계 라벨은 route handler가 moodFromValue()로 가공해 함께 내려준다(프론트는 표시만).
// moodValue도 함께 주는 이유: 기분 링/게이지가 0~100 비율로 채우기 때문.
// updatedAt이 nullable인 이유: 아바타를 아직 저장하지 않아 상태행이 없으면 route가 기본 감정으로
// 폴백하는데, 이때 존재하지도 않는 행의 갱신 시각을 now()로 지어내면 클라이언트가 "데이터 없음"과
// "방금 갱신됨"을 구분할 수 없다. 값이 없으면 없다고 내려준다.
export const AvatarStatusSchema = z.object({
  moodValue: z.number().int().min(0).max(100),
  mood: z.enum(MOODS),
  updatedAt: z.iso.datetime().nullable(),
});

export type AvatarStatus = z.infer<typeof AvatarStatusSchema>;
