import { useQuery } from '@tanstack/react-query';

import { privateFetch } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import { PendingFriendRequestListSchema } from '@/schemas/friend.schema';

export function usePendingFriendRequests() {
  return useQuery({
    queryKey: queryKeys.friends.requests(),
    queryFn: () => privateFetch('/api/friends/requests', PendingFriendRequestListSchema),
  });
}
