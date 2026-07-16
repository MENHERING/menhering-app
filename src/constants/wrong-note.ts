export const OPTION_SYMBOLS = ['①', '②', '③', '④'];

// questions.label 실데이터 12종 전체 (HTML/CSS/JavaScript/비동기/TypeScript/Git/브라우저/React/상태관리/Next.js/폼/테스팅) 기준.
export const SUBJECT_STYLE: Partial<Record<string, { bg: string; text: string }>> = {
  HTML: { bg: 'bg-subject-html-surface', text: 'text-subject-html' },
  CSS: { bg: 'bg-subject-css-surface', text: 'text-subject-css' },
  JavaScript: { bg: 'bg-subject-js-surface', text: 'text-subject-js' },
  React: { bg: 'bg-subject-react-surface', text: 'text-subject-react' },
  TypeScript: { bg: 'bg-subject-typescript-surface', text: 'text-subject-typescript' },
  Git: { bg: 'bg-subject-git-surface', text: 'text-subject-git' },
  'Next.js': { bg: 'bg-subject-nextjs-surface', text: 'text-subject-nextjs' },
  비동기: { bg: 'bg-subject-async-surface', text: 'text-subject-async' },
  브라우저: { bg: 'bg-subject-browser-surface', text: 'text-subject-browser' },
  상태관리: { bg: 'bg-subject-state-surface', text: 'text-subject-state' },
  폼: { bg: 'bg-subject-form-surface', text: 'text-subject-form' },
  테스팅: { bg: 'bg-subject-testing-surface', text: 'text-subject-testing' },
};

export const DEFAULT_SUBJECT_STYLE = { bg: 'bg-note-gray-soft', text: 'text-answer-neutral' };
