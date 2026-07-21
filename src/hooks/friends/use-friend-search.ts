import { useQuery } from '@tanstack/react-query';

import { privateFetch } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import { FriendCandidateListSchema } from '@/schemas/friend.schema';

const MIN_KEYWORD_LENGTH = 2;

export function useFriendSearch(keyword: string) {
  const trimmed = keyword.trim();

  return useQuery({
    queryKey: queryKeys.friends.search(trimmed),
    queryFn: () =>
      privateFetch(
        `/api/friends/search?keyword=${encodeURIComponent(trimmed)}`,
        FriendCandidateListSchema,
      ),
    enabled: trimmed.length >= MIN_KEYWORD_LENGTH,
  });
}
