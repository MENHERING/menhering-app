import { useQuery } from '@tanstack/react-query';

import { getMyAvatar } from '@/app/avatar/actions';
import { queryKeys } from '@/lib/query-keys';

// getMyAvatar()는 avatar 탭에서 이미 쓰던 Server Action을 그대로 재사용한다.
// (avatar 모듈은 #47의 Route Handler+Zod 컨벤션 이전에 만들어져 이 패턴을 그대로 유지)
export function useMyAvatar() {
  return useQuery({
    queryKey: queryKeys.avatar.me(),
    queryFn: () => getMyAvatar(),
  });
}
