import { Frown, Smile } from 'lucide-react';

import { MIN_HAPPINESS_FILL_PERCENT } from '@/components/common/gauge-constants';

interface HappinessGaugeProps {
  // 0(멘헤라)~100(행복) — 링과 동일한 값을 받아 채워진 비율을 맞춘다.
  happinessPercent: number;
  gainPercent: number;
}

export function HappinessGauge({ happinessPercent, gainPercent }: HappinessGaugeProps) {
  const clamped = Math.min(Math.max(happinessPercent, 0), 100);
  // 링과 동일하게 0%여도 최소한의 채움은 보이도록 한다.
  const filledPercent =
    MIN_HAPPINESS_FILL_PERCENT + ((100 - MIN_HAPPINESS_FILL_PERCENT) * clamped) / 100;

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

      <div className="bg-locked h-2.5 w-full overflow-hidden rounded-full">
        {/* 링과 같은 비율(happinessPercent)만큼만 채운다. 런타임 값이라 inline style 예외. */}
        <div
          className="from-mood-sad to-coral h-full rounded-full bg-gradient-to-r"
          style={{ width: `${filledPercent}%` }}
        />
      </div>

      <p className="text-coral text-right text-xs font-bold">행복도 +{gainPercent}%p 상승</p>
    </div>
  );
}
