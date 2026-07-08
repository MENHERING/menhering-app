import { cn } from '@/lib/cn';
import type { FontSizeOption } from '@/types/mypage/settings';

interface FontSizeControlProps {
  value: FontSizeOption;
  onChange: (value: FontSizeOption) => void;
}

const OPTIONS: { id: FontSizeOption; label: string }[] = [
  { id: 'small', label: '작게' },
  { id: 'medium', label: '기본' },
  { id: 'large', label: '크게' },
];

export function FontSizeControl({ value, onChange }: FontSizeControlProps) {
  return (
    <div
      className="border-coral/15 flex rounded-full border p-0.5"
      role="group"
      aria-label="글자 크기"
    >
      {OPTIONS.map((option) => {
        const isActive = value === option.id;

        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(option.id)}
            className={cn(
              'rounded-full px-3 py-1 text-base leading-6 font-semibold transition-colors',
              isActive ? 'bg-coral-accent text-white' : 'text-brown-muted',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
