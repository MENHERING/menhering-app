'use client';

import { useEffect, useState } from 'react';

import { Frown, Smile } from 'lucide-react';

import { MIN_HAPPINESS_FILL_PERCENT } from '@/components/common/gauge-constants';

interface HappinessGaugeProps {
  // 0(멘헤라)~100(행복) — 링과 동일한 값을 받아 채워진 비율을 맞춘다.
  happinessPercent: number;
  gainPercent: number;
}

function toFilledPercent(percent: number): number {
  const clamped = Math.min(Math.max(percent, 0), 100);

  // 링과 동일하게 0%여도 최소한의 채움은 보이도록 한다.
  return MIN_HAPPINESS_FILL_PERCENT + ((100 - MIN_HAPPINESS_FILL_PERCENT) * clamped) / 100;
}

export function HappinessGauge({ happinessPercent, gainPercent }: HappinessGaugeProps) {
  const clamped = Math.min(Math.max(happinessPercent, 0), 100);
  // 오르기 전(gainPercent만큼 빼기 전) 값에서 시작해, 마운트 직후 최종 값으로 애니메이션한다.
  const [displayPercent, setDisplayPercent] = useState(Math.max(0, clamped - gainPercent));

  useEffect(() => {
    // 다음 프레임으로 미뤄야 시작 값이 먼저 페인트된 뒤 transition이 걸린다(바로 setState하면
    // 브라우저가 두 값을 한 프레임에 묶어 애니메이션 없이 최종 값으로 바로 그릴 수 있다).
    const frame = requestAnimationFrame(() => setDisplayPercent(clamped));

    return () => cancelAnimationFrame(frame);
  }, [clamped]);

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
        {/* 런타임 값이라 inline style 예외. transition으로 채워지는 과정을 보여준다. */}
        <div
          className="from-mood-sad to-coral h-full rounded-full bg-gradient-to-r transition-[width] duration-[1400ms] ease-out"
          style={{ width: `${toFilledPercent(displayPercent)}%` }}
        />
      </div>

      <p className="text-coral text-right text-xs font-bold">행복도 +{gainPercent}%p 상승</p>
    </div>
  );
}
