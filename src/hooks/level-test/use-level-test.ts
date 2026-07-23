import { useQuery } from '@tanstack/react-query';

import { privateFetch } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import { LevelTestQuestionListSchema } from '@/schemas/level-test.schema';

export function useLevelTestQuestions() {
  return useQuery({
    queryKey: queryKeys.levelTest.all,
    queryFn: () => privateFetch('/api/level-test', LevelTestQuestionListSchema),
  });
}
