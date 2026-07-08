import type { WrongNoteItem, WrongNoteStats } from '@/types/wrong-note';

export const MOCK_WRONG_NOTE_STATS: WrongNoteStats = {
  total: 12,
  unreviewed: 8,
  reviewed: 4,
};

export const MOCK_WRONG_NOTE_ITEMS: WrongNoteItem[] = [
  {
    id: '1',
    subject: 'CSS',
    topic: 'Flexbox',
    question: 'Q. flex 컨테이너에서 주축(main axis) 방향 정렬에 사용하는 속성은?',
    options: [
      { number: 1, text: 'align-items', state: 'my_wrong' },
      { number: 2, text: 'justify-content', state: 'correct' },
      { number: 3, text: 'flex-wrap', state: 'neutral' },
      { number: 4, text: 'gap', state: 'neutral' },
    ],
    reviewStatus: 'unreviewed',
    daysAgo: '3일 전',
  },
  {
    id: '2',
    subject: 'JS',
    topic: '배열 메서드',
    question: 'Q. 다음 배열 메서드 중 원본 배열을 변경하지 않는 것은?',
    options: [
      { number: 1, text: 'push()', state: 'neutral' },
      { number: 2, text: 'splice()', state: 'neutral' },
      { number: 3, text: 'map()', state: 'correct' },
      { number: 4, text: 'sort()', state: 'my_wrong' },
    ],
    reviewStatus: 'unreviewed',
    daysAgo: '5일 전',
  },
  {
    id: '3',
    subject: 'React',
    topic: 'useEffect',
    question: 'Q. useEffect의 의존성 배열을 빈 배열 []로 두면 콜백은 언제 실행되나요?',
    options: [
      { number: 1, text: '매 렌더링마다', state: 'my_wrong' },
      { number: 2, text: '마운트 시 한 번', state: 'correct' },
      { number: 3, text: '상태가 바뀔 때마다', state: 'neutral' },
      { number: 4, text: '언마운트 시', state: 'neutral' },
    ],
    reviewStatus: 'reviewed',
    daysAgo: '1주 전',
  },
  {
    id: '4',
    subject: 'HTML',
    topic: '시맨틱 태그',
    question:
      'Q. 검색 엔진 최적화(SEO)와 접근성을 위해 페이지 주요 콘텐츠 영역에 가장 적합한 태그는?',
    options: [
      { number: 1, text: '<div>', state: 'my_wrong' },
      { number: 2, text: '<span>', state: 'neutral' },
      { number: 3, text: '<main>', state: 'correct' },
      { number: 4, text: '<section>', state: 'neutral' },
    ],
    reviewStatus: 'unreviewed',
    daysAgo: '2일 전',
  },
];
