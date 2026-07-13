// 저장값은 한글(DB user_progress.level 정합). 영문 slug 사용 금지.
export type LevelTitle = '입문' | '초급' | '중급' | '고급' | '전문가';

export interface DifficultyLevel {
  step: number;
  title: LevelTitle;
  desc: string; // 리스트 항목 짧은 설명
  resultDesc: string; // 테스트 결과 화면 문장
}
