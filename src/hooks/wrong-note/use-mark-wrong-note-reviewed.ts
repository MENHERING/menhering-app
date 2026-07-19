import { useMutation, useQueryClient } from '@tanstack/react-query';

import { privateFetch } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import { WrongNoteReviewResultSchema } from '@/schemas/wrong-note.schema';

// 오답 항목을 복습 완료 처리(단방향: reviewed로만 전환). 성공 시 XP/기분/스트릭 보상
export function useMarkWrongNoteReviewed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      privateFetch(`/api/wrong-note/${id}`, WrongNoteReviewResultSchema, { method: 'PATCH' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wrongNote.all });
      // 복습 완료 시 avatar_status.mood_value도 실제로 바뀌므로, 아바타 화면 등에서 캐시된
      // 예전 기분이 안 보이도록 같이 무효화한다.
      queryClient.invalidateQueries({ queryKey: queryKeys.avatarStatus.all });
    },
  });
}
