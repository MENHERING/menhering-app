import { z } from 'zod';

const OptionStateSchema = z.enum(['my_wrong', 'correct', 'neutral']);
const ReviewStatusSchema = z.enum(['미복습', '복습완료']);
const QuestionLevelSchema = z.enum(['입문', '초급', '중급', '고급', '전문가']);

const DbTimestampSchema = z.iso.datetime({ offset: true });

const WrongNoteOptionSchema = z.object({
  number: z.number().int().min(1),
  text: z.string(),
  state: OptionStateSchema,
});

// GET /wrong-note DTO
export const WrongNoteItemSchema = z.object({
  id: z.uuid(),
  level: QuestionLevelSchema,
  stage: z.number().int().min(1),
  label: z.string().max(50),
  question: z.string(),
  options: z.array(WrongNoteOptionSchema),
  reviewStatus: ReviewStatusSchema,
  createdAt: DbTimestampSchema,
  explanation: z.string(),
});

// GET /wrong-note DTO
export const WrongNoteStatsSchema = z.object({
  total: z.number().int().min(0),
  unreviewed: z.number().int().min(0),
  reviewed: z.number().int().min(0),
});

// GET /wrong-note DTO
export const WrongNoteListSchema = z.object({
  items: z.array(WrongNoteItemSchema),
  nextCursor: DbTimestampSchema.nullable(),
  stats: WrongNoteStatsSchema,
});

// POST /wrong-note DTO
export const RecordWrongAnswerSchema = z.object({
  questionId: z.uuid(),
  sessionId: z.uuid().optional(),
  selectedAnswer: z.number().int().min(1),
});

// POST/PATCH /wrong-note/id DTO
export const WrongAnswerSchema = z.object({
  id: z.uuid(),
  questionId: z.uuid(),
  sessionId: z.uuid().nullable(),
  selectedAnswer: z.number().int().min(1),
  correctAnswer: z.number().int().min(1),
  reviewStatus: ReviewStatusSchema,
  createdAt: DbTimestampSchema,
  reviewedAt: DbTimestampSchema.nullable(),
});

export type OptionState = z.infer<typeof OptionStateSchema>;
export type ReviewStatus = z.infer<typeof ReviewStatusSchema>;
export type QuestionLevel = z.infer<typeof QuestionLevelSchema>;
export type WrongNoteItem = z.infer<typeof WrongNoteItemSchema>;
export type WrongNoteStats = z.infer<typeof WrongNoteStatsSchema>;
export type WrongNoteList = z.infer<typeof WrongNoteListSchema>;
export type RecordWrongAnswer = z.infer<typeof RecordWrongAnswerSchema>;
export type WrongAnswer = z.infer<typeof WrongAnswerSchema>;
