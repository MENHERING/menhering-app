import { Section } from '@/components/common/Section';
import { cn } from '@/lib/cn';

interface WrongNoteResultStatsCardProps {
  correct: number;
  total: number;
  xp: number;
  accuracy: number;
}

interface StatColumnProps {
  value: string;
  label: string;
  valueClassName: string;
  isLast?: boolean;
}

function StatColumn({ value, label, valueClassName, isLast = false }: StatColumnProps) {
  return (
    <div
      className={cn(
        'flex flex-1 flex-col items-center py-5',
        !isLast && 'border-coral-accent/15 border-r',
      )}
    >
      <span className={cn('text-xl leading-7 font-bold', valueClassName)}>{value}</span>
      <span className="text-brown-muted mt-0.5 text-[11px] leading-[16.5px]">{label}</span>
    </div>
  );
}

export function WrongNoteResultStatsCard({
  correct,
  total,
  xp,
  accuracy,
}: WrongNoteResultStatsCardProps) {
  return (
    <Section className="shadow-card flex p-0">
      <StatColumn value={`${correct}/${total}`} label="정답" valueClassName="text-answer-correct" />
      <StatColumn value={`+${xp}`} label="XP" valueClassName="text-coral-accent" />
      <StatColumn value={`${accuracy}%`} label="정답률" valueClassName="text-brown-ink" isLast />
    </Section>
  );
}
