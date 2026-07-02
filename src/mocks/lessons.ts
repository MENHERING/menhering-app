import type { Curriculum, Lesson, UserProgress } from '@/types/lesson';

export const MOCK_USER_PROGRESS: UserProgress = {
  level: 13,
  xp: 1980,
  avatarSrc: '/images/avatar/panda.png',
};

export const MOCK_CURRICULUM: Curriculum = {
  id: 'javascript-core',
  title: 'JavaScript 핵심',
  level: '초급',
  clearedCount: 2,
  totalCount: 10,
};

export const MOCK_LESSONS: Lesson[] = [
  {
    id: 'lesson-1',
    order: 1,
    title: '변수와 자료형',
    status: 'completed',
    problemCount: 5,
    xpReward: 50,
  },
  {
    id: 'lesson-2',
    order: 2,
    title: '조건문과 반복문',
    status: 'completed',
    problemCount: 5,
    xpReward: 50,
  },
  {
    id: 'lesson-3',
    order: 3,
    title: '배열 메서드',
    status: 'current',
    problemCount: 5,
    xpReward: 50,
  },
  {
    id: 'lesson-4',
    order: 4,
    title: '객체와 구조 분해',
    status: 'locked',
    problemCount: 5,
    xpReward: 50,
  },
  {
    id: 'lesson-5',
    order: 5,
    title: '함수와 스코프',
    status: 'locked',
    problemCount: 5,
    xpReward: 50,
  },
];
