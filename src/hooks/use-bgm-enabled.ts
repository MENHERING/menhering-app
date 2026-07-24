'use client';

import { useSyncExternalStore } from 'react';

import { DEFAULT_BGM_ENABLED, useBgmStore } from '@/stores/bgm-store';

// 배경음악 on/off를 "화면에 그릴 때" 쓰는 훅(설정 토글). 재생 제어는 BgmController가 직접 하므로
// 그쪽은 이 훅을 쓰지 않는다. persist 복원값이 서버 마크업과 달라 생기는 하이드레이션 불일치를,
// useSyncExternalStore의 서버 스냅샷(3번째 인자=기본값)으로 막는다. [[use-sfx-enabled]]와 같은 구조.
export function useBgmEnabled(): boolean {
  return useSyncExternalStore(
    useBgmStore.subscribe,
    () => useBgmStore.getState().isBgmEnabled,
    () => DEFAULT_BGM_ENABLED,
  );
}
