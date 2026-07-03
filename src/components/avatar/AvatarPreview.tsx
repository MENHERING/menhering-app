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
  const [error, setError] = useState<string | null>(null);

  const startEdit = () => {
    setDraft(nickname);
    setError(null);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setDraft(nickname);
    setError(null);
    setIsEditing(false);
  };

  const commit = () => {
    const next = draft.trim();
    // 빈 닉네임은 저장하지 않고 편집 상태를 유지한 채 안내를 표시한다.
    if (!next) {
      setError('닉네임을 입력해주세요.');
      return;
    }
    setNickname(next);
    setError(null);
    setIsEditing(false);
  };

  return (
    // TODO: 다크모드 도입 시 카드 배경 `className="dark:bg-neutral-900"`
    <Section shadow="custom" isBorder>
      <div className="flex flex-col items-center gap-3 py-6">
        {/* 캐릭터 프리뷰 */}
        <div className="relative">
          {/* TODO: 다크모드 도입 시 원형 배경 `dark:bg-coral/10` */}
          <div className="bg-coral-soft/40 flex size-40 items-center justify-center rounded-full">
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
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={draft}
                maxLength={NICKNAME_MAX_LENGTH}
                autoFocus
                onChange={(e) => {
                  setDraft(e.target.value);
                  // 다시 입력하는 즉시 에러 안내를 제거한다.
                  if (error) setError(null);
                }}
                onBlur={commit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commit();
                  if (e.key === 'Escape') cancelEdit();
                }}
                aria-label="닉네임"
                aria-invalid={error !== null}
                className={cn(
                  'text-ink w-40 rounded-lg border px-3 py-1 text-center text-lg font-bold outline-none',
                  error ? 'border-red-500 focus:border-red-500' : 'border-cream focus:border-coral',
                  // TODO: 다크모드 도입 시 `dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100`
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
            {error && (
              <p role="alert" className="text-xs font-medium text-red-500">
                {error}
              </p>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={startEdit}
            className="flex items-center gap-1.5"
            aria-label="닉네임 수정"
          >
            {/* TODO: 다크모드 도입 시 닉네임 `dark:text-neutral-100` */}
            <span className="text-ink text-lg font-bold">{nickname}</span>
            <Pencil size={16} className="text-brown-soft" />
          </button>
        )}

        {/* 캐릭터 종류. TODO: 다크모드 도입 시 `dark:text-neutral-400` */}
        <span className="text-brown-soft text-sm">{characterType}</span>
      </div>
    </Section>
  );
}
