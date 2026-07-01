'use client';

import { ChevronLeft, X } from 'lucide-react';

interface HeaderProps {
  title: string;
  leftType: 'back' | 'none';
  onLeftPress?: () => void;
  rightType?: 'close' | 'none';
  onRightPress?: () => void;
  rightElement?: React.ReactNode;
}

export function Header({
  title,
  leftType,
  onLeftPress,
  rightType = 'none',
  onRightPress,
  rightElement,
}: HeaderProps) {
  return (
    <header className="relative flex h-14 w-full items-center justify-between bg-[#FAF0E6] px-5">
      <div className="flex h-10 w-10 items-center justify-center">
        {leftType === 'back' && (
          <button
            type="button"
            onClick={onLeftPress}
            aria-label="뒤로가기"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white"
          >
            <ChevronLeft size={24} className="text-[#3D3D3D]" />
          </button>
        )}
      </div>

      {/* 좌우 폭 차이로 제목이 밀리지 않도록 절대 위치로 중앙 고정 */}
      <h1 className="pointer-events-none absolute left-1/2 max-w-[60%] -translate-x-1/2 truncate text-[17px] font-bold text-[#3D3D3D]">
        {title}
      </h1>

      <div className="flex items-center gap-2">
        {rightElement}
        {rightType === 'close' && (
          <button type="button" onClick={onRightPress} aria-label="닫기">
            <X size={24} className="text-[#3D3D3D]" />
          </button>
        )}
      </div>
    </header>
  );
}
