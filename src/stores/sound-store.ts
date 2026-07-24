import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { SFX_STORAGE_KEY } from '@/constants/sounds';

// 효과음 on/off. 서버가 아니라 localStorage에 남긴다 — 기기마다 다르게 두고 싶은 설정이고
// (사무실에선 끄고 집에선 켬), 비로그인 화면(스플래시·로그인)에서도 동작해야 하기 때문이다.
// 저장된 값이 없을 때(첫 방문)와 서버 렌더 시점의 값. 서버에는 localStorage가 없어 항상 이 값이
// 그려지므로, 화면에 표시하는 쪽은 이 기본값으로 첫 렌더를 맞춘 뒤 복원값을 반영해야 한다.
export const DEFAULT_SFX_ENABLED = true;

interface SoundState {
  isSfxEnabled: boolean;
  setSfxEnabled: (isEnabled: boolean) => void;
  toggleSfx: () => void;
}

export const useSoundStore = create<SoundState>()(
  persist(
    (set) => ({
      isSfxEnabled: DEFAULT_SFX_ENABLED,
      setSfxEnabled: (isEnabled) => set({ isSfxEnabled: isEnabled }),
      toggleSfx: () => set((state) => ({ isSfxEnabled: !state.isSfxEnabled })),
    }),
    { name: SFX_STORAGE_KEY },
  ),
);
