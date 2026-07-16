import { useMutation, useQueryClient } from '@tanstack/react-query';

import { privateFetch } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import { WrongAnswerSchema, type RecordWrongAnswer } from '@/schemas/wrong-note.schema';

// 문제를 틀렸을 때 오답 기록 생성(또는 재도전 시 갱신)
export function useRecordWrongAnswer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: RecordWrongAnswer) =>
      privateFetch('/api/wrong-note', WrongAnswerSchema, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wrongNote.all });
    },
  });
}
