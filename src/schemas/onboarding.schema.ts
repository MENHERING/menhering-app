import { z } from 'zod';

import { LEVELS } from '@/constants/level';
import type { LevelTitle } from '@/types/level';

// 허용 값은 LEVELS(단일 출처)에서 파생해 스키마-상수 드리프트를 막는다.
function isLevelStep(step: number): boolean {
  return LEVELS.some((level) => level.step === step);
}

function isLevelTitle(value: unknown): value is LevelTitle {
  return LEVELS.some((level) => level.title === value);
}

// 온보딩 저장 입력.
export const SaveOnboardingLevelSchema = z.object({
  step: z.number().int().refine(isLevelStep, '올바른 레벨을 선택해주세요.'),
});

// DB(user_progress.level)에 저장된 값. 한글 난이도명이며, 아직 온보딩 전이면 null이다.
export const StoredLevelSchema = z.custom<LevelTitle>(isLevelTitle).nullable();

export type SaveOnboardingLevelInput = z.infer<typeof SaveOnboardingLevelSchema>;
