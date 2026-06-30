/** @type {import('@commitlint/types').UserConfig} */
const config = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'hotfix', 'style', 'refactor', 'chore', 'docs', 'init'],
    ],
    'subject-empty': [2, 'never'],
    'type-empty': [2, 'never'],
    // 헤더 최대 길이 완화 (이슈번호 포함)
    'header-max-length': [2, 'always', 120],
  },
};

export default config;
