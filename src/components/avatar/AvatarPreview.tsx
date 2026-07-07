'use client';

import { useState } from 'react';

import { Check, Pencil } from 'lucide-react';

import { AvatarBackdrop } from '@/components/avatar/AvatarBackdrop';
import { AvatarHero } from '@/components/avatar/AvatarHero';
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
    // 공용 Section 카드(rounded·border·shadow)를 재사용하되, 숲 배경 풀블리드를 위해
    // 흰 배경·좌우 패딩만 제거(bg-transparent·px-0)하고 relative·overflow-hidden을 더한다.
    // TODO: 다크모드 도입 시 이름표 배경 `dark:bg-neutral-900`
    <Section
      shadow="custom"
      isBorder
      className="relative overflow-hidden bg-transparent px-0 sm:px-0 lg:px-0"
    >
      {/* 숲 배경 — 카드 전체 */}
      <AvatarBackdrop />

      {/* Lv 배지 */}
      {typeof level === 'number' && (
        <span className="bg-coral absolute top-3 right-3 z-10 rounded-full px-2.5 py-0.5 text-xs font-bold text-white shadow-sm">
          Lv.{level}
        </span>
      )}

      {/* 콘텐츠: 캐릭터 + 이름표 */}
      <div className="relative z-10 flex flex-col items-center gap-5 px-4 pt-8 pb-5">
        <AvatarHero
          characterType={characterType}
          colorTheme={colorTheme}
          className="size-32"
          size={128}
          title={`${nickname} (${characterType})`}
        />

        {/* 이름표 카드 — 숲 위에 뜬 흰 카드(테마색 coral 테두리). 폭은 내용에 맞춰 좁게·가운데.
            TODO: 앱 다크모드 도입 시 `dark:border-coral dark:bg-neutral-900`(일괄 적용 시) */}
        <div className="border-coral mx-auto w-fit max-w-full rounded-2xl border bg-white px-5 py-3 shadow-md">
          <div className="flex flex-col items-center gap-1">
            {/* 닉네임 (편집 가능) */}
            {isEditing ? (
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center justify-center gap-2">
                  {/* 우측 저장(체크) 버튼과 대칭인 좌측 여백 → 입력이 정중앙에 오도록 */}
                  <span className="size-7 shrink-0" aria-hidden />
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
                    // 포커스 아웃(탭 아웃)은 "취소"로 간주해 기존 닉네임으로 복원한다.
                    // 빈값 안내는 명시적 저장(Enter/체크 버튼)에서만 표시한다.
                    onBlur={cancelEdit}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commit();
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    aria-label="닉네임"
                    aria-invalid={error !== null}
                    className={cn(
                      'text-ink w-40 rounded-lg border px-3 py-1 text-center text-lg font-bold outline-none',
                      error
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-cream focus:border-coral',
                      // TODO: 다크모드 도입 시 `dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100`
                    )}
                  />
                  <button
                    type="button"
                    // 버튼 클릭 시 input의 onBlur(cancelEdit)가 먼저 발생해 commit이 취소되는 것을 막는다.
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={commit}
                    aria-label="닉네임 저장"
                    className="text-coral focus-visible:ring-coral flex size-7 items-center justify-center rounded-full focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                  >
                    <Check size={18} aria-hidden />
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
                className="focus-visible:ring-coral flex items-center justify-center gap-1.5 rounded-md px-1 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                aria-label="닉네임 수정"
              >
                {/* 우측 연필과 대칭인 좌측 여백 → 닉네임 길이와 무관하게 정중앙 정렬 */}
                <span className="w-4 shrink-0" aria-hidden />
                {/* TODO: 다크모드 도입 시 닉네임 `dark:text-neutral-100` */}
                <span className="text-ink text-lg font-bold">{nickname}</span>
                <Pencil size={16} className="text-brown-soft shrink-0" aria-hidden />
              </button>
            )}

            {/* 캐릭터 종류. TODO: 다크모드 도입 시 `dark:text-neutral-400` */}
            <span className="text-brown-soft text-sm">{characterType}</span>
          </div>
        </div>
      </div>
    </Section>
  );
}
