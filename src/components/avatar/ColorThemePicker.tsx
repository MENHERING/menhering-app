'use client';

import { Check, Lock } from 'lucide-react';

import { PickerSection } from '@/components/avatar/PickerSection';
import { selectableCardClass } from '@/components/avatar/selectable-card';
import { COLOR_THEMES, THEME_COST } from '@/constants/avatar';
import { cn } from '@/lib/cn';
import { useAvatarEconomyStore } from '@/stores/avatar-economy-store';
import { useAvatarStore } from '@/stores/avatar-store';

export function ColorThemePicker() {
  const colorTheme = useAvatarStore((s) => s.colorTheme);
  const setColorTheme = useAvatarStore((s) => s.setColorTheme);
  const ownedThemes = useAvatarEconomyStore((s) => s.ownedThemes);
  const requestBuy = useAvatarEconomyStore((s) => s.requestBuy);

  return (
    <PickerSection title="색상 테마" headingId="color-theme-heading" cost={THEME_COST}>
      {COLOR_THEMES.map((theme) => {
        const owned = ownedThemes.includes(theme.value);
        const selected = owned && theme.value === colorTheme;

        return (
          <button
            key={theme.value}
            type="button"
            onClick={() => {
              if (owned) setColorTheme(theme.value);
              else requestBuy({ kind: 'theme', value: theme.value, cost: THEME_COST });
            }}
            aria-pressed={owned ? selected : undefined}
            aria-label={owned ? undefined : `${theme.value} 구매`}
            className={cn(selectableCardClass(selected), 'flex items-center gap-2 px-3 py-3')}
          >
            {/* 스와치 미리보기 (동적 색상은 SVG fill로 표현 → 인라인 style 회피) */}
            <svg viewBox="0 0 46 22" className="h-[22px] w-[46px] shrink-0" aria-hidden>
              {theme.swatches.map((color, i) => (
                <circle
                  key={`${color}-${i}`}
                  cx={11 + i * 12}
                  cy={11}
                  r={10}
                  fill={color}
                  stroke="#ffffff"
                  strokeWidth={2}
                />
              ))}
            </svg>

            {/* TODO: 다크모드 도입 시 라벨 `dark:text-neutral-100` */}
            <span className="text-ink flex-1 text-left text-sm font-semibold">{theme.value}</span>

            {selected && <Check size={16} className="text-coral shrink-0" aria-hidden />}
            {!owned && <Lock size={14} className="text-brown-soft shrink-0" aria-hidden />}
          </button>
        );
      })}
    </PickerSection>
  );
}
