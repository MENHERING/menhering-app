import { z } from 'zod';

// 온보딩 레벨 테스트 문항. 학습 퀴즈(learning-quiz.schema.ts)와 형태는 비슷하지만
// step(이 문항을 뽑아온 난이도)이 추가된다 — 정답 여부를 난이도로 환산해 레벨을 추천하기 때문이다.
// 해설(explanation)은 온보딩에서 보여주지 않아 내려받지 않는다.
export const LevelTestQuestionSchema = z.object({
  id: z.string(),
  step: z.number().int().min(1).max(5),
  prompt: z.string(),
  options: z.array(z.string()),
  correctIndex: z.number().int().min(0),
});

export const LevelTestQuestionListSchema = z.array(LevelTestQuestionSchema);

export type LevelTestQuestion = z.infer<typeof LevelTestQuestionSchema>;
