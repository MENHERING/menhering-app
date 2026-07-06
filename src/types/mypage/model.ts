// 마이페이지 도메인 모델 (UI·mock·store 공용)
export type Mood = '행복' | '보통' | '우울' | '지침' | '화남';

export interface Profile {
  level: number;
  name: string;
  difficulty: string;
  stage: number;
  mood: Mood;
  streakDays: number;
  currentXp: number;
  targetXp: number;
  avatarUrl: string;
}

export interface StatCardItem {
  value: string;
  label: string;
  variant?: StatCardVariant;
}

export type StatCardVariant =
  'continuous_learning' | 'completed_learning' | 'total_learning' | 'total_exp' | 'correct_rate';

export type ChartPeriod = 'daily' | 'weekly';

export interface ChartBar {
  label: string;
  value: number;
  isHighlighted?: boolean;
}

export interface MenuItem {
  title: string;
  description: string;
  icon: MenuIcon;
}

export type MenuIcon = 'note' | 'setting' | 'logout';

export type FriendItemKind = 'ranking' | 'add';

export interface FriendItem {
  title: string;
  description: string;
  badge: string;
  kind: FriendItemKind;
}
