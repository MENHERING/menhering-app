import type { ReviewStatus } from '@/schemas/wrong-note.schema';

// wrong_answers 테이블 raw row. POST(route.ts)/PATCH([id]/route.ts) 양쪽의 upsert/update 결과 매핑에 공용으로 쓴다.
// 프론트에서 쓰는 model.ts와 달리 서버 Route Handler 전용이라 index.ts로 재export하지 않는다.
export interface WrongAnswerRow {
  id: string;
  question_id: string;
  session_id: string | null;
  selected_answer: number;
  correct_answer: number;
  review_status: ReviewStatus;
  created_at: string;
  reviewed_at: string | null;
}
