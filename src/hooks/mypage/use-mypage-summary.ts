import { useQuery } from '@tanstack/react-query';

import { privateFetch } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import { MyPageSummarySchema } from '@/schemas/mypage.schema';

export function useMyPageSummary() {
  return useQuery({
    queryKey: queryKeys.mypage.all,
    queryFn: () => privateFetch('/api/mypage', MyPageSummarySchema),
  });
}
