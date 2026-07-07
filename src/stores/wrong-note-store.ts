import { create } from 'zustand';

import { MOCK_WRONG_NOTE_ITEMS } from '@/mocks/wrong-note.mock';
import type { WrongNoteItem } from '@/types/wrong-note';

interface WrongNoteState {
  items: WrongNoteItem[];
  markReviewed: (id: string) => void;
}

export const useWrongNoteStore = create<WrongNoteState>((set) => ({
  items: MOCK_WRONG_NOTE_ITEMS,

  markReviewed: (id) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, reviewStatus: 'reviewed' } : item,
      ),
    })),
}));
