import { ChevronRight } from 'lucide-react';

import { SETTINGS_ICON } from '@/constants/mypage-settings';
import { cn } from '@/lib/cn';
import type { SettingsInfoItem } from '@/types/mypage/settings';

interface SettingsInfoRowProps {
  item: SettingsInfoItem;
  isLast?: boolean;
}

export function SettingsInfoRow({ item, isLast = false }: SettingsInfoRowProps) {
  const Icon = SETTINGS_ICON[item.icon];

  return (
    <button
      type="button"
      className={cn(
        'flex w-full items-center gap-3 px-4 py-3.5 text-left',
        !isLast && 'border-settings-row-border border-b',
      )}
    >
      <span
        className={cn(
          'text-brown-ink flex size-9 shrink-0 items-center justify-center rounded-[14px]',
          item.iconClassName,
        )}
        aria-hidden
      >
        <Icon className="size-4" strokeWidth={2.25} />
      </span>

      <p className="text-brown-ink min-w-0 flex-1 text-sm leading-5 font-bold">{item.title}</p>

      {item.trailing ? (
        <span className="text-brown-muted shrink-0 text-[11px] leading-[16.5px]">
          {item.trailing}
        </span>
      ) : (
        <ChevronRight className="text-brown-muted size-4 shrink-0" aria-hidden />
      )}
    </button>
  );
}
