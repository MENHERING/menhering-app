'use client';

import { Section } from '@/components/common/Section';
import { cn } from '@/lib/cn';
import type { ChartBar } from '@/types/mypage/model';

interface LearningStatsSectionProps {
  data: ChartBar[];
}

const CHART_MAX = 30;

function LearningChart({ data }: { data: ChartBar[] }) {
  return (
    <div className="relative pt-4">
      <div className="text-brown-muted absolute top-4 left-0 flex h-[88px] flex-col justify-between text-[7.5px] leading-none">
        <span>30</span>
        <span>20</span>
        <span>10</span>
        <span>0</span>
      </div>

      <div className="border-sand-line ml-5 flex h-[110px] items-end justify-between gap-1 border-b pt-1">
        {data.map((bar) => {
          const heightPercent = Math.min(100, (bar.value / CHART_MAX) * 100);

          return (
            <div key={bar.label} className="flex flex-1 flex-col items-center gap-1">
              <span
                className={cn(
                  'text-[7.5px] leading-none font-bold',
                  bar.isHighlighted ? 'text-coral-highlight' : 'text-brown-muted',
                )}
              >
                {bar.value}
              </span>
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

export function LearningStatsSection({ data }: LearningStatsSectionProps) {
  return (
    <div className="px-5 pt-4">
      <Section shadow="sm" className="p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-brown-ink text-sm leading-5 font-bold">학습 통계</h3>
          <span className="bg-coral rounded-full px-2.5 py-1 text-[11px] leading-[16.5px] font-semibold text-white">
            일별
          </span>
        </div>
        <LearningChart data={data} />
      </Section>
    </div>
  );
}
