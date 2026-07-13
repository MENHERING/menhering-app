import { Coins } from 'lucide-react';

import { cn } from '@/lib/cn';

type CoinBadgeSize = 'sm' | 'md';

interface CoinBadgeProps {
  // 표시 금액. 음수면 소비(예: 구매 총액 -1500)로 그대로 렌더된다.
  amount: number;
  size?: CoinBadgeSize;
  className?: string;
}

const SIZE_STYLE: Record<CoinBadgeSize, { pill: string; icon: number; text: string }> = {
  sm: { pill: 'gap-1 px-2 py-0.5', icon: 13, text: 'text-xs' },
  md: { pill: 'gap-1.5 px-3.5 py-1.5', icon: 17, text: 'text-sm' },
};

/**
 * 코인 뱃지(공용). 흰 배경 + 코랄 테두리 + 골드 코인(다크모드 대비 위해 채움 대신 테두리).
 * 잔액 표시(양수)와 소비 표시(음수) 모두 사용.
 */
export function CoinBadge({ amount, size = 'md', className }: CoinBadgeProps) {
  const style = SIZE_STYLE[size];

  return (
    <span
      className={cn(
        // TODO: 다크모드 도입 시 배경 `dark:bg-neutral-900`
        'border-coral text-coral-dark inline-flex items-center rounded-full border bg-white font-bold',
        style.pill,
        style.text,
        className,
      )}
    >
      <Coins size={style.icon} className="text-gold" aria-hidden />
      {amount.toLocaleString()}
    </span>
  );
}
