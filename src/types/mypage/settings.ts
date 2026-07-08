export type FontSizeOption = 'small' | 'medium' | 'large';

export type SettingsIconId =
  | 'bell'
  | 'paw'
  | 'trophy'
  | 'volume'
  | 'music'
  | 'vibrate'
  | 'moon'
  | 'help'
  | 'file'
  | 'info'
  | 'font-size';

export interface FriendRequest {
  id: string;
  emoji: string;
  name: string;
  description: string;
}

export interface SettingsToggleItem {
  id: string;
  icon: SettingsIconId;
  iconClassName: string;
  title: string;
  description?: string;
  defaultChecked: boolean;
}

export interface SettingsInfoItem {
  id: string;
  icon: SettingsIconId;
  iconClassName: string;
  title: string;
  trailing?: string;
}

export interface SettingsSection {
  title: string;
  toggles?: SettingsToggleItem[];
  infoItems?: SettingsInfoItem[];
  showFontSize?: boolean;
}
