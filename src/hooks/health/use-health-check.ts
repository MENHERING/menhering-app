import { useQuery } from '@tanstack/react-query';

import { publicFetch } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import { HealthSchema } from '@/schemas/health.schema';

export function useHealthCheck() {
  return useQuery({
    queryKey: queryKeys.health.all,
    queryFn: () => publicFetch('/api/health', HealthSchema),
  });
}
