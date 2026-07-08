import { create } from 'zustand';

import { MOCK_WRONG_NOTE_ITEMS } from '@/mocks/wrong-note.mock';
import type { WrongNoteItem } from '@/types/wrong-note';

interface WrongNoteState {
  items: WrongNoteItem[];
  firstTryCorrectMap: Record<string, boolean>;
  markReviewed: (id: string) => void;
  recordSolveResult: (id: string, isFirstTryCorrect: boolean) => void;
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
}));
