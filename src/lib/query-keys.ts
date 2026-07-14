export const queryKeys = {
  health: {
    all: ['health'] as const,
  },
  learning: {
    all: ['learning'] as const,
    progress: () => [...queryKeys.learning.all, 'progress'] as const,
    quiz: (level: string, stage: number) =>
      [...queryKeys.learning.all, 'quiz', level, stage] as const,
  },
};
