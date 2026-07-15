export const OPTION_SYMBOLS = ['①', '②', '③', '④'];

export const SUBJECT_STYLE: Partial<Record<string, { bg: string; text: string }>> = {
  HTML: { bg: 'bg-subject-html-surface', text: 'text-subject-html' },
  CSS: { bg: 'bg-subject-css-surface', text: 'text-subject-css' },
  JS: { bg: 'bg-subject-js-surface', text: 'text-subject-js' },
  React: { bg: 'bg-subject-react-surface', text: 'text-subject-react' },
};

export const DEFAULT_SUBJECT_STYLE = { bg: 'bg-note-gray-soft', text: 'text-answer-neutral' };
