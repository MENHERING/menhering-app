import { useQuery } from '@tanstack/react-query';

import { privateFetch } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import { LearningProgressSchema } from '@/schemas/learning-progress.schema';

export function useLearningProgress() {
  return useQuery({
    queryKey: queryKeys.learning.progress(),
    queryFn: () => privateFetch('/api/learning/progress', LearningProgressSchema),
  });
}
