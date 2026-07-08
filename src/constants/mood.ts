import { Angry, BatteryLow, Frown, Meh, Smile, type LucideIcon } from 'lucide-react';

import type { Mood } from '@/types/mypage/model';

export const MOOD_ICON: Record<Mood, LucideIcon> = {
  행복: Smile,
  보통: Meh,
  우울: Frown,
  지침: BatteryLow,
  화남: Angry,
};
