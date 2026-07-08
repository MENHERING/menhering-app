interface HappinessGaugeProps {
  gainPercent: number;
}

export function HappinessGauge({ gainPercent }: HappinessGaugeProps) {
  return (
    <div className="mx-5 flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
      <div className="text-ink flex items-center justify-between text-sm font-semibold">
        <span>😢 멘헤라</span>
        <span>😊 행복</span>
      </div>

      <div className="from-coral to-primary-soft h-2.5 w-full rounded-full bg-gradient-to-r" />

      <p className="text-coral text-right text-xs font-bold">행복도 +{gainPercent}%p 상승</p>
    </div>
  );
}
