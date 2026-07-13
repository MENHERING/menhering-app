import type { LessonStatus } from '@/types/lesson';

// 내 레벨보다 높은 난이도의 커리큘럼은 전체 잠금
export function isCurriculumLocked(curriculumStep: number, myStep: number): boolean {
  return curriculumStep > myStep;
}

// 커리큘럼 내부는 항상 스테이지 1번부터 순서대로만 진행 가능
export function getLessonStatus(order: number, clearedCount: number): LessonStatus {
  if (order <= clearedCount) return 'completed';
  if (order === clearedCount + 1) return 'current';
  return 'locked';
}
