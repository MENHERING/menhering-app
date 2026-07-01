'use client';

import { ChevronLeft, X } from 'lucide-react';

// leftType: 'back'(뒤로가기) / 'none'(버튼 없음)
// rightType: 'close'(닫기) / 'none'(버튼 없음)
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

      {/* justify-between만 쓰면 좌/우 영역 폭에 따라 제목이 밀리므로 절대 위치로 항상 정중앙 고정 */}
      <h1 className="absolute left-1/2 -translate-x-1/2 text-[17px] font-bold text-[#3D3D3D]">
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
