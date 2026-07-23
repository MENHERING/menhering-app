import type { AppNotification } from '@/types/notifications';

// 알림 백엔드(마스코트 감정 알림 #109 웹 푸시 등)가 붙기 전까지 UI 검증용 목 알림.
// createdAt은 모듈 로드 시각 기준 상대값으로 만들어, 시간이 지나도 항상 "N시간 전"으로 자연스럽게 읽히게 한다.
const now = Date.now();
const hoursAgo = (hours: number) => new Date(now - hours * 60 * 60 * 1000).toISOString();

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    type: 'mood',
    title: '렛서가 시무룩해요',
    body: '혼자 있으니까 너무 보고 싶잖아... 언제 와?',
    createdAt: hoursAgo(2),
    isRead: false,
  },
  {
    id: 'n2',
    type: 'reminder',
    title: '오늘 학습, 아직이에요',
    body: '지금 복습하면 연속 기록을 지킬 수 있어요.',
    createdAt: hoursAgo(6),
    isRead: false,
  },
  {
    id: 'n3',
    type: 'social',
    title: '친구가 당신을 앞질렀어요',
    body: '랭킹에서 한 계단 밀렸어요. 다시 따라잡아 볼까요?',
    createdAt: hoursAgo(26),
    isRead: true,
  },
  {
    id: 'n4',
    type: 'mood',
    title: '렛서 기분이 좋아졌어요',
    body: '너 덕분에 오늘 완전 신났어. 히히.',
    createdAt: hoursAgo(50),
    isRead: true,
  },
];
