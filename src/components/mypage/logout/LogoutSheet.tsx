'use client';

import { useEffect, useRef, useState } from 'react';

import Image from 'next/image';

import { Button } from '@/components/common/Button';
import { cn } from '@/lib/cn';

interface LogoutSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DISMISS_DRAG_PX = 80;
const DISMISS_ANIMATION_MS = 250;

// 모바일 디바이스에서 스크롤 잠금 기능
function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return;

    const scrollY = window.scrollY;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollY);
    };
  }, [isLocked]);
}

interface LogoutSheetPanelProps {
  onClose: () => void;
  onConfirm: () => void;
}

function LogoutSheetPanel({ onClose, onConfirm }: LogoutSheetPanelProps) {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // 드래그 시작 위치
  const dragStartY = useRef(0);
  // 현재 포인터 이벤트 처리를 위한 참조
  const activePointerId = useRef<number | null>(null);
  // 드래그 중에는 오버레이 클릭을 무시하여 닫기 동작을 방지
  const suppressOverlayClickRef = useRef(false);
  // 드래그 중에 닫기 동작을 방지하기 위해 사용
  const closeTimerRef = useRef<number | null>(null);

  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (event: PointerEvent) => {
      if (activePointerId.current !== event.pointerId) return;

      event.preventDefault();
      const offset = Math.max(0, event.clientY - dragStartY.current);
      if (offset > 4) suppressOverlayClickRef.current = true;
      setDragOffset(offset);
    };

    const handlePointerEnd = (event: PointerEvent) => {
      if (activePointerId.current !== event.pointerId) return;

      activePointerId.current = null;
      setIsDragging(false);

      const offset = Math.max(0, event.clientY - dragStartY.current);

      if (offset >= DISMISS_DRAG_PX) {
        setDragOffset(window.innerHeight);
        closeTimerRef.current = window.setTimeout(() => {
          setDragOffset(0);
          onCloseRef.current();
        }, DISMISS_ANIMATION_MS);
        return;
      }

      setDragOffset(0);
      window.setTimeout(() => {
        suppressOverlayClickRef.current = false;
      }, 0);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', handlePointerEnd);
    window.addEventListener('pointercancel', handlePointerEnd);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerEnd);
      window.removeEventListener('pointercancel', handlePointerEnd);
    };
  }, [isDragging]);

  const handleHandlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    activePointerId.current = event.pointerId;
    dragStartY.current = event.clientY;
    suppressOverlayClickRef.current = false;
    setIsDragging(true);
  };

  const handleOverlayClick = () => {
    if (suppressOverlayClickRef.current) return;
    onCloseRef.current();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overscroll-none">
      <button
        type="button"
        aria-label="로그아웃 시트 닫기"
        className="bg-logout-overlay absolute inset-0 touch-none"
        onClick={handleOverlayClick}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-sheet-title"
        style={{
          transform: `translateY(${dragOffset}px)`,
          transition: isDragging
            ? 'none'
            : `transform ${DISMISS_ANIMATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
        }}
        className={cn(
          'relative z-10 w-full max-w-[430px] rounded-t-[24px] bg-white px-5 pb-8',
          isDragging && 'touch-none select-none',
        )}
      >
        <div
          className="flex cursor-grab touch-none justify-center py-3 active:cursor-grabbing"
          onPointerDown={handleHandlePointerDown}
        >
          <div className="bg-sheet-handle h-1 w-10 rounded-full" aria-hidden />
        </div>

        <div className="flex justify-center pt-3">
          <div className="border-coral/15 bg-linen flex size-20 items-center justify-center rounded-full border-2 border-dashed">
            <div className="relative size-16 overflow-hidden rounded-full">
              <Image
                src="/images/mypage/avatar.png"
                alt="레서판다"
                fill
                sizes="64px"
                className="object-contain"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 text-center">
          <h2 id="logout-sheet-title" className="text-brown-ink text-xl leading-7 font-bold">
            로그아웃 하시겠어요?
          </h2>
          <p className="text-brown-muted pt-2 text-sm leading-[22.75px] whitespace-pre-line">
            레서판다가 기다리고 있을게요.{'\n'}학습 기록과 연속 기록은 그대로 저장돼요.
          </p>
        </div>

        <div className="flex flex-col gap-2.5 pt-6">
          <Button
            isFullWidth
            size="md"
            onClick={onConfirm}
            className="bg-logout-danger hover:bg-logout-danger rounded-2xl shadow-none"
          >
            로그아웃
          </Button>
          <Button
            variant="secondary"
            isFullWidth
            size="md"
            onClick={onClose}
            className="text-logout-cancel-text border-sheet-cancel-border rounded-2xl shadow-none"
          >
            취소
          </Button>
        </div>
      </div>
    </div>
  );
}

export function LogoutSheet({ isOpen, onClose, onConfirm }: LogoutSheetProps) {
  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  return <LogoutSheetPanel onClose={onClose} onConfirm={onConfirm} />;
}
