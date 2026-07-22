'use client';

import { useEffect, useRef, useState } from 'react';

import { Check, Pencil } from 'lucide-react';

import { NICKNAME_MAX_LENGTH } from '@/constants/avatar';

interface NicknameFieldProps {
  nickname: string;
  /** 유효한 새 닉네임으로 저장할 때 호출(빈값은 저장 버튼이 비활성이라 호출되지 않음). */
  onSave: (nickname: string) => void;
}

/**
 * 이름표 카드 안의 닉네임 표시/편집 필드. 편집 상태·초안을 자체적으로 들고 있어
 * AvatarPreview는 값(nickname)과 저장 콜백(onSave)만 넘긴다.
 *
 * 빈 닉네임은 저장 버튼 비활성으로 막는다(별도 에러 문구 없음) → 편집/표시 모두 h-10 한 줄로
 * 높이가 고정돼 카드/배경이 밀리지 않는다.
 */
export function NicknameField({ nickname, onSave }: NicknameFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(nickname);
  const triggerRef = useRef<HTMLButtonElement>(null);
  // 명시적 종료(Enter·Escape·저장 버튼)일 때만 트리거(연필) 버튼으로 포커스를 되돌린다.
  // input/저장 버튼이 언마운트되며 포커스가 <body>로 유실돼 키보드·스크린리더 사용자가
  // 처음부터 재탐색하는 것을 막는다. blur(탭 아웃) 취소는 사용자가 이미 다른 곳으로
  // 이동 중이라 되돌리지 않는다(탭 순서 방해 방지).
  const restoreFocusRef = useRef(false);
  useEffect(() => {
    if (!isEditing && restoreFocusRef.current) {
      restoreFocusRef.current = false;
      triggerRef.current?.focus();
    }
  }, [isEditing]);

  const startEdit = () => {
    setDraft(nickname);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setDraft(nickname);
    setIsEditing(false);
  };

  const cancelEditWithFocus = () => {
    restoreFocusRef.current = true;
    cancelEdit();
  };

  // restoreFocus: 저장 후 연필 버튼으로 포커스를 되돌릴지. 키보드(Enter·스페이스)로 저장할 때만 true.
  // 마우스 클릭 저장 시엔 false → 프로그램적 포커스로 인한 :focus-visible 링(빨간 테두리)이 안 뜬다.
  const commit = (restoreFocus: boolean) => {
    const next = draft.trim();
    if (!next) return; // 빈 닉네임은 저장하지 않음(체크 버튼도 비활성).
    onSave(next);
    restoreFocusRef.current = restoreFocus;
    setIsEditing(false);
  };

  if (isEditing) {
    const canSave = draft.trim().length > 0;

    return (
      // w-full: 바깥 flex-col(items-center)이 콘텐츠 폭으로 줄이지 않고 카드 폭까지 이어지게 →
      // 입력의 flex-1이 카드 폭 기준으로 잡힌다. h-10: 표시 버튼과 같은 높이로 전환 시 안 밀리게.
      <div className="flex h-10 w-full items-center gap-1.5">
        <input
          type="text"
          value={draft}
          maxLength={NICKNAME_MAX_LENGTH}
          placeholder="닉네임을 입력해주세요."
          autoFocus
          onChange={(e) => setDraft(e.target.value)}
          // 포커스 아웃(탭 아웃)은 "취소"로 간주해 기존 닉네임으로 복원한다.
          onBlur={cancelEdit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit(true);
            if (e.key === 'Escape') cancelEditWithFocus();
          }}
          aria-label="닉네임"
          // TODO: 다크모드 도입 시 `dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100`
          className="text-ink border-cream focus:border-coral placeholder:text-brown-soft/50 min-w-0 flex-1 rounded-lg border px-3 py-1 text-center text-lg font-bold outline-none placeholder:text-sm placeholder:font-normal"
        />
        <button
          type="button"
          // 버튼 클릭 시 input의 onBlur(cancelEdit)가 먼저 발생해 commit이 취소되는 것을 막는다.
          onMouseDown={(e) => e.preventDefault()}
          // e.detail===0 = 키보드(스페이스·Enter)로 활성화 → 포커스 복귀. 마우스 클릭(>0)이면 링 생략.
          onClick={(e) => commit(e.detail === 0)}
          disabled={!canSave}
          aria-label="닉네임 저장"
          // 그림자 없음: CTA용 그림자(0_3px_10px)를 size-8 원형에 씌우면 blur가 버튼을 덮어
          // 브랜드 코랄(#e8563a)이 더 짙은 색으로 보인다. 시인성은 채움 + 크기로만 확보한다.
          className="bg-coral focus-visible:ring-coral hover:bg-coral-dark flex size-8 shrink-0 items-center justify-center rounded-full text-white transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Check size={18} aria-hidden />
        </button>
      </div>
    );
  }

  return (
    // max-w-full + 이름 truncate: 카드가 고정폭(w-56)이라 긴 닉네임이 카드를 넘치지 않게 말줄임.
    <button
      ref={triggerRef}
      type="button"
      onClick={startEdit}
      className="focus-visible:ring-coral flex h-10 max-w-full items-center justify-center gap-1.5 rounded-md px-1 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      aria-label="닉네임 수정"
    >
      {/* 우측 연필과 대칭인 좌측 여백 → 닉네임 길이와 무관하게 정중앙 정렬 */}
      <span className="w-4 shrink-0" aria-hidden />
      {/* TODO: 다크모드 도입 시 닉네임 `dark:text-neutral-100` */}
      <span className="text-ink min-w-0 truncate text-lg font-bold">{nickname}</span>
      <Pencil size={16} className="text-brown-soft shrink-0" aria-hidden />
    </button>
  );
}
