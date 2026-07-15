import { useMutation, useQueryClient } from '@tanstack/react-query';

import { privateFetch } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import { WrongAnswerSchema } from '@/schemas/wrong-note.schema';

// 오답 항목을 복습 완료 처리(단방향: reviewed로만 전환)
export function useMarkWrongNoteReviewed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      privateFetch(`/api/wrong-note/${id}`, WrongAnswerSchema, { method: 'PATCH' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wrongNote.all });
    },
  });
}
