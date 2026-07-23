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
      // invalidateQueries가 반환하는 promise를 그대로 리턴해 mutation의 settle(성공/완료 시점) 자체가
      // 캐시 무효화 완료를 포함하게 한다. 호출부가 mutate 콜백/isPending으로 "끝났다"고 판단하는
      // 시점에 목록 재조회가 이미 최신 데이터를 반영하도록 보장하기 위함(그렇지 않으면 화면 전환이
      // 무효화보다 먼저 끝나 목록이 새로고침 전까지 예전 상태로 보이는 경합이 생길 수 있다).
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.wrongNote.all }),
        // 복습 완료 시 avatar_status.mood_value도 실제로 바뀌므로, 아바타 화면 등에서 캐시된
        // 예전 기분이 안 보이도록 같이 무효화한다.
        queryClient.invalidateQueries({ queryKey: queryKeys.avatarStatus.all }),
      ]);
    },
  });
}
