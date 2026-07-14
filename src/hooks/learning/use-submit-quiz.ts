import { useMutation, useQueryClient } from '@tanstack/react-query';

import { privateFetch } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import { SubmitQuizResultSchema, type SubmitQuizRequest } from '@/schemas/learning-quiz.schema';

export function useSubmitQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: SubmitQuizRequest) =>
      privateFetch('/api/learning/quiz/submit', SubmitQuizResultSchema, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      // 진행도(clearedCount/stage)가 바뀌었을 수 있으니 다음 진입 시 새로 불러오게 한다.
      queryClient.invalidateQueries({ queryKey: queryKeys.learning.progress() });
    },
  });
}
