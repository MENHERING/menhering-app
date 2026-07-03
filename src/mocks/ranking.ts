import type { RankingEntry } from '@/types/ranking';

export const MOCK_RANKING: RankingEntry[] = [
  {
    rank: 1,
    userId: 'user-1',
    nickname: '여우콩',
    characterType: '고양이',
    colorTheme: '민트',
    xp: 1900,
  },
  {
    rank: 2,
    userId: 'user-2',
    nickname: '토끼콩',
    characterType: '토끼',
    colorTheme: '라벤더',
    xp: 1644,
  },
  {
    rank: 3,
    userId: 'user-3',
    nickname: '곰돌이',
    characterType: '강아지',
    colorTheme: '피치',
    xp: 1428,
  },
  {
    rank: 4,
    userId: 'user-4',
    nickname: '느림보',
    characterType: '고양이',
    colorTheme: '스카이',
    xp: 1280,
    lastActiveLabel: '3일 전 접속',
  },
  {
    rank: 5,
    userId: 'user-5',
    nickname: '레드판다',
    characterType: '레서판다',
    colorTheme: '클래식',
    xp: 1180,
    streakDays: 7,
    isMe: true,
  },
  {
    rank: 6,
    userId: 'user-6',
    nickname: '고슴도치',
    characterType: '강아지',
    colorTheme: '선샤인',
    xp: 1040,
    lastActiveLabel: '3일 전 접속',
  },
  {
    rank: 7,
    userId: 'user-7',
    nickname: '뱅고름',
    characterType: '토끼',
    colorTheme: '피치',
    xp: 890,
    lastActiveLabel: '2일 전 접속',
  },
  {
    rank: 8,
    userId: 'user-8',
    nickname: '야옹이',
    characterType: '고양이',
    colorTheme: '클래식',
    xp: 760,
    lastActiveLabel: '3일 전 접속',
  },
  // 전체 기간에서만 노출(주간 랭킹엔 아직 활동이 없어 집계 안 됨)
  {
    rank: 9,
    userId: 'user-9',
    nickname: '두더지',
    characterType: '강아지',
    colorTheme: '민트',
    xp: 640,
    lastActiveLabel: '10일 전 접속',
  },
];

// 주간 랭킹: 최근 활동이 있는 8명만.
export const MOCK_RANKING_WEEK: RankingEntry[] = MOCK_RANKING.filter((entry) => entry.rank <= 8);
