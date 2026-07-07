'use client';

import { CharacterRenderer } from '@/components/avatar/CharacterRenderer';
import { PickerSection } from '@/components/avatar/PickerSection';
import { selectableCardClass } from '@/components/avatar/selectable-card';
import { CHARACTER_COST, CHARACTER_TYPES } from '@/constants/avatar';
import { AVATAR_SELECT_SOUND } from '@/constants/sounds';
import { useSound } from '@/hooks/use-sound';
import { cn } from '@/lib/cn';
import { useAvatarEconomyStore } from '@/stores/avatar-economy-store';
import { useAvatarStore } from '@/stores/avatar-store';

export function CharacterPicker() {
  const characterType = useAvatarStore((s) => s.characterType);
  const colorTheme = useAvatarStore((s) => s.colorTheme);
  const setCharacterType = useAvatarStore((s) => s.setCharacterType);
  const ownedCharacters = useAvatarEconomyStore((s) => s.ownedCharacters);
  const requestBuy = useAvatarEconomyStore((s) => s.requestBuy);
  const playSelect = useSound(AVATAR_SELECT_SOUND);

  return (
    <PickerSection title="캐릭터 선택" headingId="character-heading" cost={CHARACTER_COST}>
      {CHARACTER_TYPES.map((type) => {
        const owned = ownedCharacters.includes(type);
        const selected = owned && type === characterType;
        // 보유=선택(무료)/현재 장착=사용 중. 미보유=구매(코스트 결제).
        const statusLabel = owned ? (selected ? '사용 중' : '선택') : '구매';
        const statusClass = owned
          ? selected
            ? 'bg-coral text-white'
            : 'bg-cream/60 text-brown-soft'
          : 'bg-coral-soft text-coral-dark';

        return (
          <button
            key={type}
            type="button"
            onClick={() => {
              if (owned) {
                setCharacterType(type);
                playSelect();
              } else {
                requestBuy({ kind: 'character', value: type, cost: CHARACTER_COST });
              }
            }}
            aria-pressed={owned ? selected : undefined}
            aria-label={owned ? undefined : `${type} 구매`}
            className={cn(
              selectableCardClass(selected),
              'flex flex-col items-center gap-2 px-3 py-4',
            )}
          >
            {/* TODO: 다크모드 도입 시 아바타 원형 배경 `dark:bg-coral/10` */}
            <div className="bg-coral-soft/30 flex size-20 items-center justify-center rounded-full">
              <CharacterRenderer characterType={type} colorTheme={colorTheme} className="size-16" />
            </div>

            {/* TODO: 다크모드 도입 시 라벨 `dark:text-neutral-100` */}
            <span className="text-ink text-sm font-semibold">{type}</span>

            <span
              className={cn(
                'rounded-full px-3 py-0.5 text-xs font-bold',
                // TODO: 다크모드 도입 시 비선택 배지 `dark:bg-neutral-800 dark:text-neutral-400`
                statusClass,
              )}
            >
              {statusLabel}
            </span>
          </button>
        );
      })}
    </PickerSection>
  );
}
