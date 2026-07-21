import type { Curriculum, Lesson, UserProgress } from '@/types/lesson';

export const MOCK_USER_PROGRESS: UserProgress = {
  level: 13,
  xp: 1980,
};

export const MOCK_CURRICULA: Curriculum[] = [
  {
    id: 'html-css-basic',
    title: 'HTML/CSS 기초',
    level: '입문',
    step: 1,
    clearedCount: 10,
    totalCount: 10,
  },
  {
    id: 'javascript-core',
    title: 'JavaScript 핵심',
    level: '초급',
    step: 2,
    clearedCount: 6,
    totalCount: 10,
  },
  {
    id: 'react-practice',
    title: 'React 실전',
    level: '중급',
    step: 3,
    clearedCount: 2,
    totalCount: 10,
  },
  {
    id: 'state-performance',
    title: '상태관리와 성능 최적화',
    level: '고급',
    step: 4,
    clearedCount: 0,
    totalCount: 7,
  },
  {
    id: 'architecture-edge-case',
    title: '아키텍처와 엣지케이스',
    level: '전문가',
    step: 5,
    clearedCount: 0,
    totalCount: 7,
  },
];

const XP_REWARD = 50;

function buildLessons(curriculumId: string, titles: string[]): Lesson[] {
  return titles.map((title, index) => ({
    id: `${curriculumId}-lesson-${index + 1}`,
    curriculumId,
    order: index + 1,
    title,
    problemCount: 5,
    xpReward: XP_REWARD,
  }));
}

export const MOCK_LESSONS: Lesson[] = [
  ...buildLessons('html-css-basic', [
    'HTML 문서 구조',
    '시맨틱 태그',
    'CSS 선택자',
    '박스 모델',
    'Flexbox 레이아웃',
    'Grid 레이아웃',
    '반응형 웹 기초',
    '폼과 입력 요소',
    '웹 접근성 기초',
    '브라우저 동작 원리',
  ]),
  ...buildLessons('javascript-core', [
    '변수와 자료형',
    '조건문과 반복문',
    '함수와 스코프',
    '배열 메서드',
    '객체와 구조 분해',
    '클로저',
    '프로토타입과 클래스',
    '비동기와 Promise',
    '모듈 시스템',
    'ES6+ 문법',
  ]),
  ...buildLessons('react-practice', [
    'JSX와 컴포넌트',
    'Props와 State',
    '이벤트 핸들링',
    '리스트 렌더링과 key',
    '폼 상태 관리',
    'useEffect와 생명주기',
    '커스텀 훅',
    'Context API',
    '라우팅 기초',
    '에러 바운더리',
  ]),
  ...buildLessons('state-performance', [
    '전역 상태 관리',
    '서버 상태와 캐싱',
    '렌더링 최적화',
    '코드 스플리팅',
    '접근성 심화',
    '테스트 전략',
    '웹 성능 측정',
  ]),
  ...buildLessons('architecture-edge-case', [
    '컴포넌트 아키텍처 설계',
    '디자인 시스템 구축',
    'SSR과 하이드레이션',
    '마이크로 프론트엔드',
    '대규모 상태 설계',
    '엣지 케이스와 방어적 코딩',
    '프론트엔드 보안',
  ]),
];
