import type { ChartBar, FriendItem, MenuItem, Profile, StatCardItem } from '@/types/mypage';

export const MOCK_MYPAGE_PROFILE: Profile = {
  level: 7,
  name: '레드판다',
  difficulty: '초급',
  stage: 3,
  mood: '보통',
  streakDays: 4,
  currentXp: 1480,
  targetXp: 2000,
  avatarUrl: '/images/mypage/avatar.png',
};

export const MOCK_MYPAGE_STATS_ROW1: StatCardItem[] = [
  { value: '4일', label: '연속 학습', variant: 'continuous_learning' },
  { value: '320', label: '완료 문제', variant: 'completed_learning' },
  { value: '142회', label: '총 학습', variant: 'total_learning' },
];

export const MOCK_MYPAGE_STATS_ROW2: StatCardItem[] = [
  { value: '1,480', label: '총 XP', variant: 'total_exp' },
  { value: '87%', label: '정답률', variant: 'correct_rate' },
];

export const MOCK_MYPAGE_WEEKLY_CHART: ChartBar[] = [
  { label: '월', value: 30 },
  { label: '화', value: 55 },
  { label: '수', value: 20 },
  { label: '목', value: 90, isHighlighted: true },
  { label: '금', value: 45 },
  { label: '토', value: 65 },
  { label: '일', value: 15 },
];

export const MOCK_MYPAGE_DAILY_CHART: ChartBar[] = [
  { label: '월', value: 12 },
  { label: '화', value: 18 },
  { label: '수', value: 8 },
  { label: '목', value: 25, isHighlighted: true },
  { label: '금', value: 14 },
  { label: '토', value: 20 },
  { label: '일', value: 6 },
];

export const MOCK_MYPAGE_WRONG_NOTE: MenuItem = {
  title: '오답 노트',
  description: '12개 · 재학습',
  icon: 'note',
};

export const MOCK_MYPAGE_SETTINGS: MenuItem = {
  title: '설정',
  description: '알림 · 학습 목표',
  icon: 'setting',
};

export const MOCK_MYPAGE_LOGOUT: Pick<MenuItem, 'title' | 'icon'> = {
  title: '로그아웃',
  icon: 'logout',
};

export const MOCK_MYPAGE_FRIENDS: FriendItem[] = [
  {
    title: '친구 랭킹',
    description: '친구 중 2위 · 주간 순위',
    badge: '#2',
    kind: 'ranking',
  },
  {
    title: '친구 추가',
    description: '받은 요청 2 · 코드로 추가',
    badge: '2',
    kind: 'add',
  },
];
