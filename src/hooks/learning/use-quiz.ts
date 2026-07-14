import { useQuery } from '@tanstack/react-query';

import { privateFetch } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import { QuizQuestionListSchema } from '@/schemas/learning-quiz.schema';

export function useQuiz(level: string, stage: number) {
  return useQuery({
    queryKey: queryKeys.learning.quiz(level, stage),
    queryFn: () =>
      privateFetch(
        `/api/learning/quiz?level=${encodeURIComponent(level)}&stage=${stage}`,
        QuizQuestionListSchema,
      ),
  });
}
