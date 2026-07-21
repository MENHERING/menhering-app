import { useQuery } from '@tanstack/react-query';

import { privateFetch } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import { MyFriendCodeSchema } from '@/schemas/friend.schema';

export function useMyFriendCode() {
  return useQuery({
    queryKey: queryKeys.friends.myCode(),
    queryFn: () => privateFetch('/api/friends/my-code', MyFriendCodeSchema),
  });
}
