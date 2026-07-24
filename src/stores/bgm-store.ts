import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { BGM_STORAGE_KEY } from '@/constants/sounds';

// 배경음악 on/off. 효과음(sound-store)과 같은 이유로 서버가 아니라 localStorage에 둔다
// (기기마다 다르게, 비로그인 화면에서도 동작). [[sound-store]]와 쌍이다.
//
// ⚠️ 기본값은 효과음(true)과 달리 false다: 처음 설치한 사용자에게 예고 없이 음악이 흘러나오면
// 놀라기 때문에, 한 번 켠 사람에게만 이후 자동 복원한다.
export const DEFAULT_BGM_ENABLED = false;

interface BgmState {
  isBgmEnabled: boolean;
  setBgmEnabled: (isEnabled: boolean) => void;
  toggleBgm: () => void;
}

export const useBgmStore = create<BgmState>()(
  persist(
    (set) => ({
      isBgmEnabled: DEFAULT_BGM_ENABLED,
      setBgmEnabled: (isEnabled) => set({ isBgmEnabled: isEnabled }),
      toggleBgm: () => set((state) => ({ isBgmEnabled: !state.isBgmEnabled })),
    }),
    { name: BGM_STORAGE_KEY },
  ),
);
