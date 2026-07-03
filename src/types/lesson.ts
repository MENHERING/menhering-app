export type LessonStatus = 'completed' | 'current' | 'locked';

export interface Lesson {
  id: string;
  order: number;
  title: string;
  status: LessonStatus;
  problemCount: number;
  xpReward: number;
}

export interface Curriculum {
  id: string;
  title: string;
  level: string;
  clearedCount: number;
  totalCount: number;
}

export interface UserProgress {
  level: number;
  xp: number;
  avatarSrc: string;
}
