import { z } from 'zod';

import { LEVEL_STEPS, LEVEL_TITLES } from '@/constants/level';

// 온보딩 저장 입력. 허용 단계는 상수(단일 출처)에서 파생해 스키마-상수 드리프트를 방지한다.
export const SaveOnboardingLevelSchema = z.object({
  step: z
    .number()
    .int()
    .refine((step) => LEVEL_STEPS.includes(step), '올바른 레벨을 선택해주세요.'),
});

// DB(user_progress.level)에 저장된 값. 한글 난이도명이며, 아직 온보딩 전이면 null이다.
export const StoredLevelSchema = z.enum(LEVEL_TITLES).nullable();

export type SaveOnboardingLevelInput = z.infer<typeof SaveOnboardingLevelSchema>;
