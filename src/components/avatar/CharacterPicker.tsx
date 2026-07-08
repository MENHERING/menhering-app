'use client';

import { useState } from 'react';

import { Hammer, Lock } from 'lucide-react';

import { CharacterRenderer } from '@/components/avatar/CharacterRenderer';
import { PickerSection } from '@/components/avatar/PickerSection';
import { selectableCardClass } from '@/components/avatar/selectable-card';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { CHARACTER_COST, CHARACTER_TYPES } from '@/constants/avatar';
import { CHARACTER_REGISTRY } from '@/constants/character-registry';
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
  const playSelect = useSound(AVATAR_SELECT_SOUND, 0.1);

  // 미보유 캐릭터는 아직 미구현 → 구매 대신 "준비중" 안내 모달만 띄운다.
  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false);

  // 섹션 가격 배지(mock). 실제 구매 로직은 준비중이라 카드 클릭 시 안내 모달만 뜬다.
  return (
    <PickerSection title="캐릭터 선택" headingId="character-heading" cost={CHARACTER_COST}>
      {CHARACTER_TYPES.map((type) => {
        const owned = ownedCharacters.includes(type);
        const selected = owned && type === characterType;
        const thumbnail = CHARACTER_REGISTRY[type].thumbnail;
        // 현재 장착=사용중. 그 외(보유·미보유)는 선택 라벨로 통일(미보유는 클릭 시 준비중 안내).
        const statusLabel = selected ? '사용중' : '선택';
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
                setIsComingSoonOpen(true);
              }
            }}
            aria-pressed={owned ? selected : undefined}
            aria-label={owned ? undefined : `${type} (준비 중)`}
            className={cn(
              selectableCardClass(selected),
              'flex flex-col items-center gap-2 px-3 py-4',
            )}
          >
            {/* TODO: 다크모드 도입 시 아바타 원형 배경 `dark:bg-coral/10` */}
            <div className="bg-coral-soft/30 flex size-20 items-center justify-center rounded-full">
              {/* 미보유(미구현) 캐릭터는 자물쇠로 통일 표시 */}
              {owned ? (
                thumbnail ? (
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
                )
              ) : (
                <Lock className="text-brown-soft size-7" aria-hidden />
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

      <ConfirmModal
        isOpen={isComingSoonOpen}
        icon={
          <span className="bg-coral-soft/40 flex size-14 items-center justify-center rounded-full">
            <Hammer className="text-coral size-7" aria-hidden />
          </span>
        }
        title="준비중입니다"
        description="아직 준비 중인 캐릭터예요. 조금만 기다려 주세요!"
        confirmLabel="확인"
        hideCancel
        onConfirm={() => setIsComingSoonOpen(false)}
        onCancel={() => setIsComingSoonOpen(false)}
      />
    </PickerSection>
  );
}
