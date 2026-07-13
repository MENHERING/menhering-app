import { create } from 'zustand';

// 온보딩(직접 선택 또는 레벨테스트)에서 확정한 "내 레벨"(1~5).
// 인증/DB 연동 전까지는 세션 동안만 유지되는 임시 저장소다.
interface UserLevelState {
  step: number;
  setStep: (step: number) => void;
}

export const useUserLevelStore = create<UserLevelState>((set) => ({
  step: 3,
  setStep: (step) => set({ step }),
}));
