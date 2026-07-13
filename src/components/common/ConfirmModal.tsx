'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';

import { AnimatePresence, motion } from 'motion/react';

import { Button } from '@/components/common/Button';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  /** 제목 위 중앙 아이콘(선택, 예: 준비중 안내 아이콘) */
  icon?: ReactNode;
  /** 본문 설명(선택) */
  description?: string;
  /** 제목 아래 강조 영역(선택, 예: 코인 총액 뱃지) */
  highlight?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** 확인 버튼 비활성 (예: 코인 부족) */
  confirmDisabled?: boolean;
  /** 확인 처리 중(비동기). 확인 버튼 로딩·백드롭/취소 잠금으로 중복 제출을 막는다. */
  confirmLoading?: boolean;
  /** 취소 버튼 숨김 → 단일 버튼 안내 모달로 사용 (예: "준비중입니다") */
  hideCancel?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * 공용 확인 모달. 백드롭/취소 버튼으로 닫고, 확인 시 onConfirm 호출.
 * 앱 컨테이너와 무관하게 뷰포트 중앙에 뜨도록 `fixed inset-0`.
 */
export function ConfirmModal({
  isOpen,
  title,
  icon,
  description,
  highlight,
  confirmLabel = '확인',
  cancelLabel = '취소',
  confirmDisabled = false,
  confirmLoading = false,
  hideCancel = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  // 다이얼로그 이름표(제목)와 연결해 스크린리더가 모달 목적을 즉시 안내하게 한다.
  const titleId = useId();
  // onCancel이 매 렌더 새 함수로 와도 Esc 리스너를 재등록하지 않도록 ref로 최신 참조만 유지.
  const onCancelRef = useRef(onCancel);
  useEffect(() => {
    onCancelRef.current = onCancel;
  }, [onCancel]);

  // 처리 중(confirmLoading)엔 취소를 막아야 하므로 최신 값을 ref로 들고 Esc 핸들러에서 참조한다.
  const confirmLoadingRef = useRef(confirmLoading);
  useEffect(() => {
    confirmLoadingRef.current = confirmLoading;
  }, [confirmLoading]);

  // 열릴 때: 다이얼로그로 포커스 이동(키보드 사용자가 모달 안에서 시작) + Esc로 닫기.
  useEffect(() => {
    if (!isOpen) return;

    dialogRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !confirmLoadingRef.current) onCancelRef.current();
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center px-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {/* 백드롭: 클릭 시 취소. 처리 중엔 잠금(중복 제출·이탈 방지). */}
          <button
            type="button"
            aria-label="닫기"
            onClick={onCancel}
            disabled={confirmLoading}
            className="absolute inset-0 bg-black/40"
          />

          {/* TODO: 다크모드 도입 시 카드 배경 `dark:bg-neutral-900` */}
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            className="shadow-custom relative w-full max-w-[320px] rounded-2xl bg-white p-6 outline-none"
            initial={{ scale: 0.96, y: 8 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 8 }}
            transition={{ duration: 0.15 }}
          >
            {icon && <div className="mb-3 flex justify-center">{icon}</div>}

            <h2 id={titleId} className="text-ink text-center text-base font-bold">
              {title}
            </h2>

            {highlight && <div className="mt-3 flex justify-center">{highlight}</div>}

            {description && (
              <p className="text-brown-soft mt-2 text-center text-sm">{description}</p>
            )}

            <div className="mt-5 flex gap-2">
              {!hideCancel && (
                <Button
                  variant="secondary"
                  size="md"
                  isFullWidth
                  disabled={confirmLoading}
                  onClick={onCancel}
                >
                  {cancelLabel}
                </Button>
              )}
              <Button
                variant="primary"
                size="md"
                isFullWidth
                disabled={confirmDisabled}
                isLoading={confirmLoading}
                onClick={onConfirm}
              >
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
