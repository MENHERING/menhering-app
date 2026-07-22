export type LessonStatus = 'completed' | 'current' | 'locked';

export interface Lesson {
  id: string;
  curriculumId: string;
  // 커리큘럼 내 순서(1부터) — 스테이지 잠금 판단 기준
  order: number;
  title: string;
  problemCount: number;
  xpReward: number;
}

// 로드맵 렌더링 시점에 clearedCount 기준으로 계산된 상태를 붙인 뷰 모델
export type LessonWithStatus = Lesson & { status: LessonStatus };

export interface Curriculum {
  id: string;
  title: string;
  level: string;
  // 난이도 단계(1~5) — 내 레벨보다 높으면 커리큘럼 전체 잠금
  step: number;
  clearedCount: number;
  totalCount: number;
}
