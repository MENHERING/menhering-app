// 앱 공용 라우트 경로. 페이지 간 링크·하단 탭바가 공유하는 단일 출처(single source of truth).
export const ROUTES = {
  HOME: '/home',
  LOGIN: '/login',
  LEVEL: '/level',
  LEVEL_TEST: '/level-test',
  LEVEL_TEST_RESULT: '/level-test/result',
  LEARNING: '/learning',
  AVATAR: '/avatar',
  MYPAGE: '/mypage',
  MYPAGE_FRIENDS_ADD: '/mypage/friends/add',
  MYPAGE_SETTINGS: '/mypage/settings',
  RANKING: '/learning/ranking',
  WRONG_NOTE: '/mypage/wrong-note',
} as const;
