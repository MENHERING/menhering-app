'use client';

import { useState } from 'react';

import { Section } from '@/components/common/Section';
import { cn } from '@/lib/cn';
import type { ChartBar, ChartPeriod } from '@/types/mypage/model';

interface LearningStatsSectionProps {
  weeklyData: ChartBar[];
  dailyData: ChartBar[];
}

const CHART_MAX = 100;

function PeriodToggle({
  period,
  onChange,
}: {
  period: ChartPeriod;
  onChange: (period: ChartPeriod) => void;
}) {
  return (
    <div className="flex gap-1" role="group" aria-label="학습 통계 기간">
      {(
        [
          { id: 'daily' as const, label: '일별' },
          { id: 'weekly' as const, label: '주별' },
        ] as const
      ).map(({ id, label }) => {
        const isActive = period === id;

        return (
          <button
            key={id}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(id)}
            className={cn(
              'rounded-full px-2.5 py-1 text-[11px] leading-[16.5px] font-semibold transition-colors',
              isActive ? 'bg-coral font-bold text-white' : 'bg-cream-toggle text-brown-muted',
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function LearningChart({ data }: { data: ChartBar[] }) {
  return (
    <div className="relative pt-4">
      <div className="text-brown-muted absolute top-4 left-0 flex h-[88px] flex-col justify-between text-[7.5px] leading-none">
        <span>100</span>
        <span>75</span>
        <span>50</span>
        <span>25</span>
        <span>0</span>
      </div>

      <div className="border-sand ml-5 flex h-[110px] items-end justify-between gap-1 border-b pt-1">
        {data.map((bar) => {
          const heightPercent = (bar.value / CHART_MAX) * 100;

          return (
            <div key={bar.label} className="flex flex-1 flex-col items-center gap-1">
              {bar.isHighlighted ? (
                <span className="text-coral-highlight text-[7.5px] leading-none font-bold">
                  {bar.value}
                </span>
              ) : (
                <span className="h-[9px]" aria-hidden />
              )}
              <div className="flex h-[77px] w-full items-end justify-center">
                <div
                  className={cn(
                    'w-[26px] max-w-full rounded-t-sm',
                    bar.isHighlighted ? 'bg-coral-highlight' : 'bg-coral/70',
                  )}
                  style={{ height: `${heightPercent}%` }}
                />
              </div>
              <span className="text-brown-muted text-[8.5px] leading-none">{bar.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function LearningStatsSection({ weeklyData, dailyData }: LearningStatsSectionProps) {
  const [period, setPeriod] = useState<ChartPeriod>('weekly');
  const chartData = period === 'weekly' ? weeklyData : dailyData;

  return (
    <div className="px-5 pt-4">
      <Section shadow="sm" className="p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-brown-ink text-sm leading-5 font-bold">학습 통계</h3>
          <PeriodToggle period={period} onChange={setPeriod} />
        </div>
        <LearningChart data={chartData} />
      </Section>
    </div>
  );
}
