import {
  Bell,
  CaseSensitive,
  CircleHelp,
  FileText,
  Info,
  Moon,
  Music,
  PawPrint,
  Trophy,
  Vibrate,
  Volume2,
  type LucideIcon,
} from 'lucide-react';

import type { SettingsIconId } from '@/types/mypage/settings';

export const SETTINGS_ICON: Record<SettingsIconId, LucideIcon> = {
  bell: Bell,
  paw: PawPrint,
  trophy: Trophy,
  volume: Volume2,
  music: Music,
  vibrate: Vibrate,
  moon: Moon,
  help: CircleHelp,
  file: FileText,
  info: Info,
  'font-size': CaseSensitive,
};
