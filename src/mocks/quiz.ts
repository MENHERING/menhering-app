import type { QuizQuestion } from '@/types/quiz/model';

// 5문제 전체가 공유하는 제한 시간(초). 문제별로 리셋되지 않는다.
export const QUIZ_TIME_LIMIT_SECONDS = 60;

export const MOCK_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'quiz-1',
    order: 1,
    prompt: 'React에서 key가 필요한 가장 정확한 이유는?',
    options: [
      '렌더링 속도 향상만을 위해',
      '리스트 재조정 과정에서 항목의 정체성을 추적하기 위해',
      'CSS 우선순위를 안정적으로 유지하기 위해',
      '컴포넌트 이름을 자동으로 바꾸기 위해',
    ],
    correctIndex: 1,
    explanation:
      'key는 단순 속도 향상이 아니라, 리스트가 바뀔 때 어떤 항목이 추가·삭제·이동됐는지 React가 식별하는 기준이에요. 인덱스를 key로 쓰면 순서가 바뀔 때 잘못 매칭되는 버그가 생겨요.',
  },
  {
    id: 'quiz-2',
    order: 2,
    prompt: 'useEffect의 두 번째 인자(dependency array)를 생략하면?',
    options: [
      '컴포넌트가 리렌더링될 때마다 매번 실행된다',
      '최초 마운트 시 한 번만 실행된다',
      '컴포넌트가 언마운트될 때만 실행된다',
      '자동으로 값이 바뀐 의존성만 추적해 실행된다',
    ],
    correctIndex: 0,
    explanation:
      'dependency array를 아예 생략하면 매 렌더링마다 effect가 실행돼요. 한 번만 실행하려면 빈 배열 []을, 특정 값이 바뀔 때만 실행하려면 그 값을 배열에 넣어야 해요.',
  },
  {
    id: 'quiz-3',
    order: 3,
    prompt: 'useState로 만든 상태를 직접 변경(mutate)하면 안 되는 이유는?',
    options: [
      'React가 참조 비교로 변경을 감지해 리렌더링 여부를 판단하기 때문',
      '자바스크립트 문법상 금지돼 있기 때문',
      '메모리 누수가 즉시 발생하기 때문',
      '타입스크립트 컴파일 에러가 나기 때문',
    ],
    correctIndex: 0,
    explanation:
      'React는 상태 객체의 참조(reference)가 바뀌었는지로 변경을 감지해요. 원본을 직접 수정하면 참조가 그대로라 리렌더링이 아예 안 일어날 수 있어요.',
  },
  {
    id: 'quiz-4',
    order: 4,
    prompt: 'Tailwind CSS에서 동적으로 계산되는 값(예: 런타임 퍼센트)을 표현하기 어려운 이유는?',
    options: [
      'Tailwind가 런타임 CSS-in-JS 엔진이라 느리기 때문',
      '클래스가 정적 분석으로 빌드 시점에 생성되기 때문',
      'JIT 모드에서는 아예 커스텀 값을 지원하지 않기 때문',
      'CSS 변수 자체를 지원하지 않기 때문',
    ],
    correctIndex: 1,
    explanation:
      'Tailwind는 소스 코드에 실제로 적힌 클래스 문자열을 정적으로 스캔해서 CSS를 생성해요. 런타임에 계산된 값은 소스에 리터럴로 존재하지 않아서 빌드 시 클래스가 만들어지지 않아요. 이런 경우는 inline style이 정답이에요.',
  },
  {
    id: 'quiz-5',
    order: 5,
    prompt: 'Next.js App Router에서 layout.tsx의 역할은?',
    options: [
      '해당 라우트 세그먼트와 하위 페이지가 공유하는 UI 셸을 감싼다',
      '페이지별 SEO 메타데이터만 담당한다',
      '클라이언트 상태 관리 스토어를 정의한다',
      'API 라우트 핸들러를 등록한다',
    ],
    correctIndex: 0,
    explanation:
      'layout.tsx는 같은 세그먼트의 page.tsx와 하위 라우트가 공통으로 쓰는 UI(헤더, 내비게이션 등)를 감싸고, 페이지 전환 시에도 상태가 유지돼요.',
  },
];
