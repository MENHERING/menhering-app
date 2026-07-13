import { create } from 'zustand';

import { DEFAULT_MOOD } from '@/constants/avatar';
import type { Mood } from '@/types/mypage/model';

// 아바타의 감정 상태. 사용자가 편집하는 값이 아니라 서버(avatar_status)에서 읽어오는 파생값이라
// 편집(draft) 스토어인 avatar-store와 분리한다. 같이 두면 initial·isDirty 계산마다
// "단 mood는 제외" 예외가 붙고, 실수로 baseline에 포함시키는 순간 감정이 바뀔 때마다
// 미저장 이탈 경고가 뜬다.
//
// TODO(#42): avatar_status 조회로 교체. 서버 상태이므로 인프라가 준비되면
// TanStack Query 훅으로 옮기는 게 맞다 — Provider·query key factory·API client 세팅은 #47 소관이라
// 아직 없다(현재 QueryClientProvider 자체가 없음). 그때 이 스토어 내부만 갈아끼우면 소비처는 그대로다.
interface AvatarStatusState {
  mood: Mood;
  setMood: (mood: Mood) => void;
}

export const useAvatarStatusStore = create<AvatarStatusState>((set) => ({
  mood: DEFAULT_MOOD,
  setMood: (mood) => set({ mood }),
}));
