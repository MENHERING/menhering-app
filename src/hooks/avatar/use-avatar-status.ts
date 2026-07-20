import { useQuery } from '@tanstack/react-query';

import { privateFetch } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import { AvatarStatusSchema } from '@/schemas/avatar-status.schema';

// 서버 avatar_status를 조회한다. mood_value→Mood 라벨 가공은 route handler가 이미 끝내
// { moodValue, mood, updatedAt }로 내려주므로, 여기선 그대로 전달만 한다(프론트는 표시만).
// 감쇠는 서버가 조회 시점 기준으로 정산하므로, 화면을 계속 띄워둔 채로도 값이 바뀐 걸 보려면
// 폴링이 필요하다(새로고침/포커스 전환 없이는 react-query가 재조회할 계기가 없음).
const REFETCH_INTERVAL_MS = 60 * 1000;

export function useAvatarStatus() {
  return useQuery({
    queryKey: queryKeys.avatarStatus.all,
    queryFn: () => privateFetch('/api/avatar-status', AvatarStatusSchema),
    refetchInterval: REFETCH_INTERVAL_MS,
  });
}
