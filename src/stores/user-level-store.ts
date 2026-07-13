import { create } from 'zustand';

import { DEFAULT_LEVEL_STEP } from '@/constants/level';

// 온보딩(직접 선택 또는 레벨테스트)에서 확정한 "내 레벨"(1~5).
// 원본은 DB(user_progress.level)이며, 이 스토어는 화면 간 공유용 세션 캐시다.
// TODO: 새로고침 시 초기값으로 돌아가므로, 서버에서 읽은 레벨로 하이드레이션 필요(학습 화면 연동 시).
interface UserLevelState {
  step: number;
  setStep: (step: number) => void;
}

export const useUserLevelStore = create<UserLevelState>((set) => ({
  step: DEFAULT_LEVEL_STEP,
  setStep: (step) => set({ step }),
}));
