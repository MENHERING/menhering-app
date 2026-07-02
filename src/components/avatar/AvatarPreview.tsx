'use client';

import { useState } from 'react';

import { Check, Pencil } from 'lucide-react';

import { CharacterRenderer } from '@/components/avatar/CharacterRenderer';
import { Section } from '@/components/common/Section';
import { NICKNAME_MAX_LENGTH } from '@/constants/avatar';
import { cn } from '@/lib/cn';
import { useAvatarStore } from '@/stores/avatar-store';

interface AvatarPreviewProps {
  // TODO: 레벨/XP는 user_progress 도메인 연동 후 실제 값으로 교체
  level?: number;
}

export function AvatarPreview({ level }: AvatarPreviewProps) {
  const characterType = useAvatarStore((s) => s.characterType);
  const colorTheme = useAvatarStore((s) => s.colorTheme);
  const nickname = useAvatarStore((s) => s.nickname);
  const setNickname = useAvatarStore((s) => s.setNickname);

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(nickname);

  const startEdit = () => {
    setDraft(nickname);
    setIsEditing(true);
  };

  const commit = () => {
    const next = draft.trim();
    if (next) setNickname(next);
    else setDraft(nickname);
    setIsEditing(false);
  };

  return (
    <Section shadow="custom" className="dark:bg-neutral-900" isBorder>
      <div className="flex flex-col items-center gap-3 py-6">
        {/* 캐릭터 프리뷰 */}
        <div className="relative">
          <div className="bg-coral-soft/40 dark:bg-coral/10 flex size-40 items-center justify-center rounded-full">
            <CharacterRenderer
              characterType={characterType}
              colorTheme={colorTheme}
              className="size-32"
              title={`${nickname} (${characterType})`}
            />
          </div>

          {typeof level === 'number' && (
            <span className="bg-coral absolute right-1 bottom-2 rounded-full px-2.5 py-0.5 text-xs font-bold text-white shadow-sm">
              Lv.{level}
            </span>
          )}
        </div>

        {/* 닉네임 (편집 가능) */}
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={draft}
              maxLength={NICKNAME_MAX_LENGTH}
              autoFocus
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commit();
                if (e.key === 'Escape') {
                  setDraft(nickname);
                  setIsEditing(false);
                }
              }}
              aria-label="닉네임"
              className={cn(
                'text-ink w-40 rounded-lg border px-3 py-1 text-center text-lg font-bold',
                'border-cream focus:border-coral outline-none',
                'dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100',
              )}
            />
            <button
              type="button"
              onClick={commit}
              aria-label="닉네임 저장"
              className="text-coral flex size-7 items-center justify-center rounded-full"
            >
              <Check size={18} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={startEdit}
            className="flex items-center gap-1.5"
            aria-label="닉네임 수정"
          >
            <span className="text-ink text-lg font-bold dark:text-neutral-100">{nickname}</span>
            <Pencil size={16} className="text-brown-soft" />
          </button>
        )}

        {/* 캐릭터 종류 */}
        <span className="text-brown-soft text-sm dark:text-neutral-400">{characterType}</span>
      </div>
    </Section>
  );
}
