import { z } from 'zod';

// DB에서 읽은 값을 그대로 믿지 않고 런타임에 검증한다(타입 단언 대신).
// 아직 값이 없는 신규 유저를 위해 null을 허용하고, 소비하는 쪽에서 기본값으로 채운다.
export const ProgressSummarySchema = z.object({
  stage: z.number().int().nullable(),
  xp: z.number().int().nullable(),
  streak: z.number().int().nullable(),
});

export const SessionSummarySchema = z.object({
  correct_count: z.number().int().nullable(),
  total_count: z.number().int().nullable(),
  created_at: z.iso.datetime({ offset: true }),
});

export const SessionSummaryListSchema = z.array(SessionSummarySchema);

export type ProgressSummary = z.infer<typeof ProgressSummarySchema>;
export type SessionSummary = z.infer<typeof SessionSummarySchema>;
