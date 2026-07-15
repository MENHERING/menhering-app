import type { OptionState, QuestionLevel, ReviewStatus } from '@/schemas/wrong-note.schema';

export type WrongNoteFilter = 'all' | ReviewStatus | string;

export interface WrongNoteOption {
  number: number;
  text: string;
  state: OptionState;
}

export interface WrongNoteItem {
  id: string;
  level: QuestionLevel;
  stage: number;
  label: string;
  question: string;
  options: WrongNoteOption[];
  reviewStatus: ReviewStatus;
  createdAt: string;
  explanation: string;
}
