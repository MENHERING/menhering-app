import { create } from 'zustand';

import { MOCK_WRONG_NOTE_ITEMS } from '@/mocks/wrong-note.mock';
import type { WrongNoteItem } from '@/types/wrong-note';

interface WrongNoteState {
  items: WrongNoteItem[];
  firstTryCorrectMap: Record<string, boolean>;
  markReviewed: (id: string) => void;
  recordSolveResult: (id: string, isFirstTryCorrect: boolean) => void;
  resetSolveResults: () => void;
}

export const useWrongNoteStore = create<WrongNoteState>((set) => ({
  items: MOCK_WRONG_NOTE_ITEMS,
  firstTryCorrectMap: {},

  markReviewed: (id) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, reviewStatus: 'reviewed' } : item,
      ),
    })),

  // 다시 풀기 결과 화면의 정답/정답률 집계에 사용
  recordSolveResult: (id, isFirstTryCorrect) =>
    set((state) => ({
      firstTryCorrectMap: { ...state.firstTryCorrectMap, [id]: isFirstTryCorrect },
    })),

  // 새 배치 시작 시 이전 풀이 기록이 이번 결과 집계에 섞이지 않도록 초기화
  resetSolveResults: () => set({ firstTryCorrectMap: {} }),
}));
