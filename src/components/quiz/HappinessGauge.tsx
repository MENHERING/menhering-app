import { Frown, Smile } from 'lucide-react';

interface HappinessGaugeProps {
  gainPercent: number;
}

export function HappinessGauge({ gainPercent }: HappinessGaugeProps) {
  return (
    <div className="mx-5 flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
      <div className="text-ink flex items-center justify-between text-sm font-semibold">
        <span className="flex items-center gap-1.5">
          <Frown size={18} className="text-mood-sad" />
          멘헤라
        </span>
        <span className="flex items-center gap-1.5">
          행복
          <Smile size={18} className="text-coral" />
        </span>
      </div>

      <div className="from-mood-sad to-coral h-2.5 w-full rounded-full bg-gradient-to-r" />

      <p className="text-coral text-right text-xs font-bold">행복도 +{gainPercent}%p 상승</p>
    </div>
  );
}
