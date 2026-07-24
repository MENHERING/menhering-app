import { useQuery } from '@tanstack/react-query';

import { privateFetch } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import { LevelTestQuestionListSchema } from '@/schemas/level-test.schema';

export function useLevelTestQuestions() {
  return useQuery({
    queryKey: queryKeys.levelTest.all,
    queryFn: () => privateFetch('/api/level-test', LevelTestQuestionListSchema),
    // 시험 도중에는 절대 다시 받아오면 안 된다. 서버가 매 요청 보기를 섞어 내려주는데,
    // 화면은 답을 "몇 번째 보기"인지(인덱스)로 들고 있어서 순서가 바뀌면 이미 고른 답이
    // 다른 보기를 가리키게 된다(채점·선택 표시 둘 다 어긋남).
    // 기본 staleTime이 1분이라, 문항을 풀다 앱 밖으로 나갔다 돌아오는 것만으로도 발생한다.
    staleTime: Infinity,
  });
}
