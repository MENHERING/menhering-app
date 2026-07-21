import type { FriendItem, MenuItem, Profile } from '@/types/mypage';

// TODO: 아바타 이미지 추가?
export const MOCK_MYPAGE_PROFILE: Pick<Profile, 'avatarUrl'> = {
  avatarUrl: '/images/mypage/avatar.png',
};

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
