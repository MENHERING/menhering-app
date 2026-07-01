import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/cn';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const BASE =
  'inline-flex select-none items-center justify-center font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50';

const VARIANT: Record<ButtonVariant, string> = {
  // 채움 #E8563A + 그림자: 다음 / 저장하기 / 초급으로 시작
  primary: 'bg-coral text-white shadow-[0_3px_10px_rgba(0,0,0,0.12)] hover:bg-coral-dark',
  // 흰 배경 + 코랄 텍스트 + 옅은 테두리: 직접 다시 고르기
  secondary:
    'border border-coral-border bg-white text-coral shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:bg-coral-soft/40',
  // 코랄 테두리: 복사 / 거절
  outline: 'border border-coral bg-transparent text-coral hover:bg-coral-soft/50',
  ghost: 'bg-transparent text-coral hover:bg-coral-soft/50',
};

// radius 14px (CTA 확정값), sm은 pill
const SIZE: Record<ButtonSize, string> = {
  sm: 'h-9 gap-1.5 rounded-full px-4 text-sm', // pill: 수락 / 복사 / 다시 풀기
  md: 'h-11 gap-2 rounded-[14px] px-5 text-sm',
  lg: 'h-13 gap-2 rounded-[14px] px-6 text-base', // CTA (~52px)
};

export function Button({
  variant = 'primary',
  size = 'lg',
  fullWidth = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={cn(BASE, VARIANT[variant], SIZE[size], fullWidth && 'w-full', className)}
      {...props}
    >
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          {leftIcon}
          {children}
          {rightIcon}
        </>
      )}
    </button>
  );
}

function Spinner() {
  return (
    <svg
      className="size-5 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-label="로딩 중"
      role="status"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
      />
    </svg>
  );
}
