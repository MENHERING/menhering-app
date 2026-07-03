export interface Level {
  step: number;
  title: string;
  desc: string;
  resultDesc: string;
}

// 실력 단계 — 레벨 선택/테스트 결과 화면 공유
export const LEVELS: Level[] = [
  {
    step: 1,
    title: '입문',
    desc: 'HTML/CSS 기초부터 천천히',
    resultDesc: '웹의 기초 개념부터 차근차근 익히는 단계예요.',
  },
  {
    step: 2,
    title: '초급',
    desc: '기본 문법과 화면 구현 중심',
    resultDesc: '기초는 알고 있지만 꾸준한 연습이 필요한 단계예요.',
  },
  {
    step: 3,
    title: '중급',
    desc: '면접 단골 개념과 실전 문제',
    resultDesc: '실전 문제로 개념을 탄탄히 다지는 단계예요.',
  },
  {
    step: 4,
    title: '고급',
    desc: '상태관리, 비동기, 최적화',
    resultDesc: '상태관리·비동기까지 깊이 있게 다루는 단계예요.',
  },
  {
    step: 5,
    title: '전문가',
    desc: '아키텍처와 까다로운 엣지케이스',
    resultDesc: '아키텍처와 엣지케이스를 아우르는 단계예요.',
  },
];
