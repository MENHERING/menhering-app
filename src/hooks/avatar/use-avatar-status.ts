import { useQuery } from '@tanstack/react-query';

import { privateFetch } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import { AvatarStatusSchema } from '@/schemas/avatar-status.schema';

// 서버 avatar_status를 조회한다. mood_value→Mood 라벨 가공은 route handler가 이미 끝내
// { moodValue, mood, updatedAt }로 내려주므로, 여기선 그대로 전달만 한다(프론트는 표시만).
export function useAvatarStatus() {
  return useQuery({
    queryKey: queryKeys.avatarStatus.all,
    queryFn: () => privateFetch('/api/avatar-status', AvatarStatusSchema),
  });
}
