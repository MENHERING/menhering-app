'use client';

import { CharacterRenderer } from '@/components/avatar/CharacterRenderer';
import { PickerSection } from '@/components/avatar/PickerSection';
import { selectableCardClass } from '@/components/avatar/selectable-card';
import { CHARACTER_TYPES } from '@/constants/avatar';
import { cn } from '@/lib/cn';
import { useAvatarStore } from '@/stores/avatar-store';

export function CharacterPicker() {
  const characterType = useAvatarStore((s) => s.characterType);
  const colorTheme = useAvatarStore((s) => s.colorTheme);
  const setCharacterType = useAvatarStore((s) => s.setCharacterType);

  return (
    <PickerSection title="캐릭터 선택" headingId="character-heading">
      {CHARACTER_TYPES.map((type) => {
        const selected = type === characterType;

        return (
          <button
            key={type}
            type="button"
            onClick={() => setCharacterType(type)}
            aria-pressed={selected}
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
                selected ? 'bg-coral text-white' : 'bg-cream/60 text-brown-soft',
              )}
            >
              {selected ? '사용 중' : '선택'}
            </span>
          </button>
        );
      })}
    </PickerSection>
  );
}
