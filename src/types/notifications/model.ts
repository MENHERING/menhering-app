// 알림 종류. 설정 화면의 알림 카테고리(마스코트 감정 / 학습 리마인더 / 친구·랭킹)와 짝을 이룬다.
export type NotificationType = 'mood' | 'reminder' | 'social';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  // ISO 8601 문자열. 목데이터는 로드 시각 기준 상대값으로 만들어 항상 "N시간 전"으로 읽히게 한다.
  createdAt: string;
  isRead: boolean;
}
