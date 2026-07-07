'use client';

import { useEffect, useRef } from 'react';

import { AlertTriangle, Check, X, type LucideIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import { cn } from '@/lib/cn';

type ToastVariant = 'success' | 'error';

interface ToastProps {
  /** 노출 여부. false로 바뀌면 퇴장 애니메이션 후 언마운트된다. */
  isOpen: boolean;
  /** 표시할 문구 */
  message: string;
  /** 자동 닫힘 등으로 닫혀야 할 때 호출 (부모가 open을 false로 내리는 용도) */
  onClose: () => void;
  variant?: ToastVariant;
  /** 자동 닫힘 시간(ms). 0이면 자동으로 닫지 않는다(에러 등). */
  duration?: number;
  /** 닫기(X) 버튼 노출. auth 필수 안내처럼 스스로 닫으면 안 되는 토스트는 false로 둔다. */
  dismissible?: boolean;
  /** 래퍼 위치 조정용 (예: 저장 바가 있는 화면은 `bottom-40`으로 위로 올림) */
  className?: string;
}

// 기본 자동 닫힘 시간(성공 토스트 기준)
const DEFAULT_DURATION = 2000;

// 색은 코랄 브랜드로 통일하고 성공/에러는 아이콘 모양으로만 구분한다.
const VARIANT_ICON: Record<ToastVariant, LucideIcon> = {
  success: Check,
  error: AlertTriangle,
};

/**
 * 모바일 하단 중앙에 뜨는 공용 토스트.
 *
 * Footer(`sticky bottom-0 z-20`) 위에 뜨도록 `fixed ... z-30`, 앱 컨테이너 폭(430px)에
 * 맞춰 가운데 정렬한다. 래퍼는 `pointer-events-none`이라 아래의 저장 버튼 탭을 막지 않는다.
 *
 * 색상은 코랄 토큰(`bg-coral-soft`/`text-coral-dark`)으로 넣어, 다크모드 도입 시
 * `:root` 오버라이드만으로 함께 적응된다(globals.css의 다크모드 계획과 동일).
 */
export function Toast({
  isOpen,
  message,
  onClose,
  variant = 'success',
  duration = DEFAULT_DURATION,
  dismissible = false,
  className,
}: ToastProps) {
  // onClose가 매 렌더 새 함수로 와도 타이머가 리셋되지 않도록 ref로 최신 참조만 유지한다.
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen || duration <= 0) return;

    const timer = setTimeout(() => onCloseRef.current(), duration);

    return () => clearTimeout(timer);
  }, [isOpen, duration]);

  const Icon = VARIANT_ICON[variant];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={cn(
            'pointer-events-none fixed inset-x-0 bottom-20 z-30 mx-auto flex w-full max-w-[430px] justify-center px-4',
            className,
          )}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.2 }}
        >
          {/* TODO: 다크모드 도입 시 카드 배경 `dark:bg-neutral-800` */}
          <div
            role={variant === 'error' ? 'alert' : 'status'}
            className={cn(
              'shadow-custom inline-flex items-center gap-2.5 rounded-full bg-white py-2.5 pl-2.5',
              dismissible ? 'pr-2' : 'pr-5',
            )}
          >
            <span className="bg-coral-soft flex size-8 items-center justify-center rounded-full">
              <Icon className="text-coral-dark size-[18px]" strokeWidth={2.5} aria-hidden />
            </span>
            <span className="text-coral-dark text-sm font-semibold">{message}</span>

            {dismissible && (
              <button
                type="button"
                onClick={onClose}
                aria-label="닫기"
                // 래퍼가 pointer-events-none이므로 버튼만 다시 활성화한다.
                className="text-coral-dark/50 hover:text-coral-dark focus-visible:ring-coral pointer-events-auto flex size-6 items-center justify-center rounded-full focus-visible:ring-2 focus-visible:outline-none"
              >
                <X size={16} aria-hidden />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
