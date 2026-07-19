import { create } from 'zustand';

interface ReviewReward {
  xpReward: number;
  moodValueBefore: number | null;
  moodValueAfter: number | null;
  streak: number | null;
}

interface WrongNoteState {
  firstTryCorrectMap: Record<string, boolean>;
  totalXpEarned: number;
  moodBefore: number | null;
  moodAfter: number | null;
  streak: number | null;
  recordSolveResult: (id: string, isFirstTryCorrect: boolean) => void;
  applyReviewReward: (reward: ReviewReward) => void;
  resetSolveResults: () => void;
}

export const useWrongNoteStore = create<WrongNoteState>((set) => ({
  firstTryCorrectMap: {},
  totalXpEarned: 0,
  moodBefore: null,
  moodAfter: null,
  streak: null,

  recordSolveResult: (id, isFirstTryCorrect) =>
    set((state) => ({
      firstTryCorrectMap: { ...state.firstTryCorrectMap, [id]: isFirstTryCorrect },
    })),

  // moodBefore는 배치 첫 보상에서만 기록, moodAfter/streak는 항상 최신값으로 갱신.
  applyReviewReward: (reward) =>
    set((state) => ({
      totalXpEarned: state.totalXpEarned + reward.xpReward,
      moodBefore: state.moodBefore ?? reward.moodValueBefore,
      moodAfter: reward.moodValueAfter ?? state.moodAfter,
      streak: reward.streak ?? state.streak,
    })),

  resetSolveResults: () =>
    set({
      firstTryCorrectMap: {},
      totalXpEarned: 0,
      moodBefore: null,
      moodAfter: null,
      streak: null,
    }),
}));
