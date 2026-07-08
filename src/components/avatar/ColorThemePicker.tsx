'use client';

import { Check, Lock } from 'lucide-react';

import { PickerSection } from '@/components/avatar/PickerSection';
import { selectableCardClass } from '@/components/avatar/selectable-card';
import { COLOR_THEMES, THEME_COST } from '@/constants/avatar';
import { AVATAR_SELECT_SOUND } from '@/constants/sounds';
import { useSound } from '@/hooks/use-sound';
import { cn } from '@/lib/cn';
import { useAvatarEconomyStore } from '@/stores/avatar-economy-store';
import { useAvatarStore } from '@/stores/avatar-store';

export function ColorThemePicker() {
  const colorTheme = useAvatarStore((s) => s.colorTheme);
  const setColorTheme = useAvatarStore((s) => s.setColorTheme);
  const ownedThemes = useAvatarEconomyStore((s) => s.ownedThemes);
  const requestBuy = useAvatarEconomyStore((s) => s.requestBuy);
  const playSelect = useSound(AVATAR_SELECT_SOUND, 0.1);

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
              // 터치 즉시 선택 효과음(보유/미보유 무관).
              playSelect();
              if (owned) {
                setColorTheme(theme.value);
              } else {
                requestBuy({ kind: 'theme', value: theme.value, cost: THEME_COST });
              }
            }}
            aria-pressed={owned ? selected : undefined}
            aria-label={owned ? undefined : `${theme.value} 구매`}
            className={cn(selectableCardClass(selected), 'flex items-center gap-2 px-3 py-3')}
          >
            {/* 스와치 미리보기 — 실제 캐릭터에 입혀지는 body(털) 색 한 가지.
                (동적 색상은 SVG fill로 표현 → 인라인 style 회피) */}
            <svg viewBox="0 0 22 22" className="size-[22px] shrink-0" aria-hidden>
              <circle
                cx={11}
                cy={11}
                r={10}
                fill={theme.roles.body}
                stroke="rgba(0,0,0,0.1)"
                strokeWidth={1}
              />
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
