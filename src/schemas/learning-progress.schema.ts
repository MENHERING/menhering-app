import { z } from 'zod';

export const CurriculumSchema = z.object({
  level: z.string(),
  step: z.number().int(),
  clearedCount: z.number().int(),
  totalCount: z.number().int(),
});

export const LearningProgressSchema = z.object({
  myStep: z.number().int(),
  level: z.number().int(),
  currentXp: z.number().int(),
  targetXp: z.number().int(),
  curricula: z.array(CurriculumSchema),
});

export type LearningProgress = z.infer<typeof LearningProgressSchema>;
