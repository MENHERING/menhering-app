export const queryKeys = {
  health: {
    all: ['health'] as const,
  },
  avatarStatus: {
    all: ['avatar-status'] as const,
  },
  wrongNote: {
    all: ['wrong-note'] as const,
    list: () => [...queryKeys.wrongNote.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.wrongNote.all, 'detail', id] as const,
  },
};
