import { Toggle } from '@/components/common/Toggle';
import { SETTINGS_ICON } from '@/constants/mypage-settings';
import { cn } from '@/lib/cn';
import type { SettingsToggleItem } from '@/types/mypage/settings';

interface SettingsToggleRowProps {
  item: SettingsToggleItem;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  isLast?: boolean;
}

export function SettingsToggleRow({
  item,
  checked,
  onCheckedChange,
  disabled = false,
  isLast = false,
}: SettingsToggleRowProps) {
  const Icon = SETTINGS_ICON[item.icon];

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3.5',
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

      <div className="min-w-0 flex-1">
        <p className="text-brown-ink text-sm leading-5 font-bold">{item.title}</p>
        {item.description ? (
          <p className="text-brown-muted text-[11px] leading-[16.5px]">{item.description}</p>
        ) : null}
      </div>

      <Toggle
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        aria-label={item.title}
      />
    </div>
  );
}
