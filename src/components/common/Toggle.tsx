'use client';

import { cn } from '@/lib/cn';

interface ToggleProps {
  /** 켜짐 여부 (controlled) */
  checked: boolean;
  /** 상태 변경 콜백 */
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  /** 스크린리더용 라벨 (시각 라벨이 따로 없을 때 필수) */
  'aria-label'?: string;
  id?: string;
  className?: string;
}

// 설정 화면 온오프 스위치 (효과음 / 배경음악 / 진동 / 다크모드 등)
// role="switch" 버튼 → space/enter 로 토글, 접근성 확보
export function Toggle({
  checked,
  onCheckedChange,
  disabled = false,
  id,
  className,
  ...aria
}: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      aria-label={aria['aria-label']}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'relative h-7 w-12 shrink-0 rounded-full transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'bg-coral' : 'bg-black/15',
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          'absolute top-1 left-1 size-5 rounded-full bg-white shadow-sm transition-transform',
          checked && 'translate-x-5',
        )}
      />
    </button>
  );
}
