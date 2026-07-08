import { cn } from '@/lib/cn';

type IconSlotSize = 'sm' | 'md' | 'lg' | 'xl';

interface IconSlotProps {
  size?: IconSlotSize;
  className?: string;
}

const SIZE: Record<IconSlotSize, string> = {
  sm: 'size-[18px]',
  md: 'size-6',
  lg: 'size-9',
  xl: 'size-[22px]',
};

// lucide-react 아이콘 교체 전 빈 슬롯
export function IconSlot({ size = 'sm', className }: IconSlotProps) {
  return <span className={cn('inline-flex shrink-0', SIZE[size], className)} aria-hidden />;
}
