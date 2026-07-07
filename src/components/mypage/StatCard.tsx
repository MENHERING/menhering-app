import { Flame, CheckIcon, LibraryBig, Astroid, Crosshair, type LucideIcon } from 'lucide-react';

import { Section } from '@/components/common/Section';
import { cn } from '@/lib/cn';
import type { StatCardVariant } from '@/types/mypage/model';

interface StatCardProps {
  value: string;
  label: string;
  variant: StatCardVariant;
  className?: string;
}

const STAT_CARD_ICON: Record<StatCardVariant, { Icon: LucideIcon; bg: string }> = {
  continuous_learning: { Icon: Flame, bg: 'bg-red-soft' },
  completed_learning: { Icon: CheckIcon, bg: 'bg-green-soft' },
  total_learning: { Icon: LibraryBig, bg: 'bg-blue-soft' },
  total_exp: { Icon: Astroid, bg: 'bg-yellow-soft' },
  correct_rate: { Icon: Crosshair, bg: 'bg-purple-soft' },
};

export function StatCard({ value, label, variant, className }: StatCardProps) {
  const { Icon, bg } = STAT_CARD_ICON[variant];

  return (
    <Section shadow="sm" className="overflow-hidden p-0">
      <article className={cn('flex flex-col items-center gap-0.5 rounded-2xl p-3', className)}>
        <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-full', bg)}>
          <Icon size={18} className="text-brown-ink" aria-hidden />
        </span>
        <p className="text-brown-ink text-sm leading-5 font-bold">{value}</p>
        <p className="text-brown-muted text-[10px] leading-[15px]">{label}</p>
      </article>
    </Section>
  );
}
