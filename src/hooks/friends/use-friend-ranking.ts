import { useQuery } from '@tanstack/react-query';

import { privateFetch } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import { RankingEntryListSchema } from '@/schemas/ranking.schema';

export function useFriendRanking() {
  return useQuery({
    queryKey: queryKeys.friends.ranking(),
    queryFn: () => privateFetch('/api/friends/ranking', RankingEntryListSchema),
  });
}
