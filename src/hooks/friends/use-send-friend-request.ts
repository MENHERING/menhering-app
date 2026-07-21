import { useMutation, useQueryClient } from '@tanstack/react-query';

import { privateFetch } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import { FriendRequestActionResultSchema } from '@/schemas/friend.schema';

export function useSendFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (targetUserId: string) =>
      privateFetch('/api/friends/requests', FriendRequestActionResultSchema, {
        method: 'POST',
        body: JSON.stringify({ targetUserId }),
      }),
    onSuccess: () => {
      // 검색 결과의 requestStatus, 받은 요청 목록 둘 다 영향받을 수 있어 friends 전체를 무효화한다.
      queryClient.invalidateQueries({ queryKey: queryKeys.friends.all });
    },
  });
}
