import { useMutation, useQueryClient } from '@tanstack/react-query';

import { privateFetch } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import {
  FriendRequestActionResultSchema,
  type RespondFriendRequest,
} from '@/schemas/friend.schema';

interface RespondFriendRequestInput extends RespondFriendRequest {
  requestId: string;
}

export function useRespondFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, action }: RespondFriendRequestInput) =>
      privateFetch(`/api/friends/requests/${requestId}`, FriendRequestActionResultSchema, {
        method: 'PATCH',
        body: JSON.stringify({ action }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.friends.all });
    },
  });
}
