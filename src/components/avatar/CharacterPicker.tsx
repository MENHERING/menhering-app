'use client';

import { CharacterRenderer } from '@/components/avatar/CharacterRenderer';
import { PickerSection } from '@/components/avatar/PickerSection';
import { selectableCardClass } from '@/components/avatar/selectable-card';
import { CHARACTER_COST, CHARACTER_TYPES } from '@/constants/avatar';
import { CHARACTER_REGISTRY } from '@/constants/character-registry';
import { AVATAR_SELECT_SOUND, AVATAR_SFX_VOLUME } from '@/constants/sounds';
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
  const playSelect = useSound(AVATAR_SELECT_SOUND, AVATAR_SFX_VOLUME);

  // 보유=클릭 시 장착, 미보유=클릭 시 구매 확인 모달(공용, AvatarClient가 pendingBuy로 렌더)로 유도.
  return (
    <PickerSection title="캐릭터 선택" headingId="character-heading" cost={CHARACTER_COST}>
      {CHARACTER_TYPES.map((type) => {
        const owned = ownedCharacters.includes(type);
        const selected = owned && type === characterType;
        const thumbnail = CHARACTER_REGISTRY[type].thumbnail;
        // 장착=사용중 / 보유·미장착=선택 / 미보유=구매.
        const statusLabel = selected ? '사용중' : owned ? '선택' : '구매';
        // 미장착은 액션 유도색(coral) 대신 muted 배지로 표시.
        const statusClass = selected ? 'bg-coral text-white' : 'bg-cream/60 text-brown-soft';

        return (
          <button
            key={type}
            type="button"
            onClick={() => {
              // 터치 즉시 선택 효과음(보유/미보유 무관).
              playSelect();
              if (owned) {
                setCharacterType(type);
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
              {/* 보유 여부와 무관하게 썸네일을 보여준다. 미보유는 클릭 시 구매 모달로 유도. */}
              {thumbnail ? (
                // 실제 아트의 얼굴 크롭 — origin을 얼굴에 두고 확대해 원형에 담는다(워터마크는 위로 빠짐).
                <div className="size-16 overflow-hidden rounded-full">
                  {/* eslint-disable-next-line @next/next/no-img-element -- 정적 로컬 에셋 썸네일, next/image 최적화 불필요 */}
                  <img
                    src={thumbnail}
                    alt=""
                    aria-hidden
                    className="size-full origin-[50%_10%] scale-[1.75] object-cover"
                  />
                </div>
              ) : (
                <CharacterRenderer
                  characterType={type}
                  colorTheme={colorTheme}
                  className="size-16"
                />
              )}
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
