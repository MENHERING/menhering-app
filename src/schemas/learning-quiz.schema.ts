import { z } from 'zod';

export const QuizQuestionSchema = z.object({
  id: z.string(),
  order: z.number().int(),
  prompt: z.string(),
  options: z.array(z.string()),
  correctIndex: z.number().int(),
  explanation: z.string(),
});

export const QuizQuestionListSchema = z.array(QuizQuestionSchema);

export const SubmitAnswerSchema = z.object({
  questionId: z.string(),
  // 1~4 (option_1~4 중 몇 번을 골랐는지)
  selectedOption: z.number().int().min(1).max(4),
});

export const SubmitQuizRequestSchema = z.object({
  level: z.string(),
  stage: z.number().int(),
  answers: z.array(SubmitAnswerSchema),
  durationSec: z.number().int().nullable().optional(),
});

export const SubmitQuizResultSchema = z.object({
  correctCount: z.number().int(),
  wrongCount: z.number().int(),
  isSuccess: z.boolean(),
  moodValue: z.number().int().nullable(),
  // 첫 클리어일 때만 0보다 큼(복습은 0). 결과 화면 "행복도 +N%p 상승" 표시에 그대로 쓴다.
  moodGain: z.number().int(),
  xpReward: z.number().int(),
  coinReward: z.number().int(),
});

export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;
export type SubmitQuizRequest = z.infer<typeof SubmitQuizRequestSchema>;
export type SubmitQuizResult = z.infer<typeof SubmitQuizResultSchema>;
