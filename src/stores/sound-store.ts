import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { SFX_STORAGE_KEY } from '@/constants/sounds';

// 효과음 on/off. 서버가 아니라 localStorage에 남긴다 — 기기마다 다르게 두고 싶은 설정이고
// (사무실에선 끄고 집에선 켬), 비로그인 화면(스플래시·로그인)에서도 동작해야 하기 때문이다.
interface SoundState {
  isSfxEnabled: boolean;
  setSfxEnabled: (isEnabled: boolean) => void;
  toggleSfx: () => void;
}

export const useSoundStore = create<SoundState>()(
  persist(
    (set) => ({
      isSfxEnabled: true,
      setSfxEnabled: (isEnabled) => set({ isSfxEnabled: isEnabled }),
      toggleSfx: () => set((state) => ({ isSfxEnabled: !state.isSfxEnabled })),
    }),
    { name: SFX_STORAGE_KEY },
  ),
);
