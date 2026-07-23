'use client';

import { useSyncExternalStore } from 'react';

import { DEFAULT_SFX_ENABLED, useSoundStore } from '@/stores/sound-store';

// 효과음 on/off를 "화면에 그릴 때" 쓰는 훅. 재생 여부 판단은 useSound가 getState()로 직접 읽으므로
// 이 훅을 거치지 않는다.
//
// persist가 localStorage에서 복원한 값은 서버가 그린 마크업과 다를 수 있어, 스토어를 그대로 구독하면
// 하이드레이션 불일치가 난다. useSyncExternalStore의 서버 스냅샷(3번째 인자)은 SSR과 하이드레이션
// 첫 렌더 양쪽에 쓰이므로, 기본값으로 맞춰 그린 뒤 복원값으로 다시 그리게 된다.
export function useSfxEnabled(): boolean {
  return useSyncExternalStore(
    useSoundStore.subscribe,
    () => useSoundStore.getState().isSfxEnabled,
    () => DEFAULT_SFX_ENABLED,
  );
}
