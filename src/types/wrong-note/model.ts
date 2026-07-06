export type WrongNoteSubject =
  | 'HTML'
  | 'CSS'
  | 'JS'
  | 'React'
  | 'Next.js'
  | 'TypeScript'
  | '비동기'
  | '폼'
  | '상태관리'
  | 'Git'
  | '브라우저'
  | '테스팅';

export type ReviewStatus = 'unreviewed' | 'reviewed';

export type OptionState = 'my_wrong' | 'correct' | 'neutral';

export type WrongNoteFilter = 'all' | 'unreviewed' | 'reviewed' | WrongNoteSubject;

export interface WrongNoteOption {
  number: number;
  text: string;
  state: OptionState;
}

export interface WrongNoteItem {
  id: string;
  subject: WrongNoteSubject;
  topic: string;
  question: string;
  options: WrongNoteOption[];
  reviewStatus: ReviewStatus;
  daysAgo: string;
}

export interface WrongNoteStats {
  total: number;
  unreviewed: number;
  reviewed: number;
}
