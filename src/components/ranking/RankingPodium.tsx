import { Crown } from 'lucide-react';

import { CharacterRenderer } from '@/components/avatar/CharacterRenderer';
import { cn } from '@/lib/cn';
import type { RankingEntry } from '@/types/ranking';

interface RankingPodiumProps {
  first: RankingEntry;
  second: RankingEntry;
  third: RankingEntry;
}

type PodiumPosition = 1 | 2 | 3;

const PODIUM_STYLE: Record<
  PodiumPosition,
  { avatarSize: string; barHeight: string; barColor: string }
> = {
  1: { avatarSize: 'size-20', barHeight: 'h-20', barColor: 'bg-coral' },
  2: { avatarSize: 'size-16', barHeight: 'h-12', barColor: 'bg-primary-soft' },
  3: { avatarSize: 'size-16', barHeight: 'h-8', barColor: 'bg-gold' },
};

interface PodiumSlotProps {
  entry: RankingEntry;
  position: PodiumPosition;
}

function PodiumSlot({ entry, position }: PodiumSlotProps) {
  const style = PODIUM_STYLE[position];

  return (
    <div className="flex flex-1 flex-col items-center gap-2">
      <div className="relative">
        {position === 1 && (
          <Crown
            size={24}
            className="absolute -top-6 left-1/2 -translate-x-1/2 fill-[var(--gold)] text-[var(--gold)]"
          />
        )}
        <div
          className={cn(
            'bg-coral-soft/40 flex items-center justify-center rounded-full',
            style.avatarSize,
          )}
        >
          <CharacterRenderer
            characterType={entry.characterType}
            colorTheme={entry.colorTheme}
            className="size-4/5"
          />
        </div>
      </div>

      <span className="text-ink text-sm font-bold">{entry.nickname}</span>
      <span className="text-brown-soft text-xs font-semibold">{entry.xp.toLocaleString()} XP</span>

      {/* 순위별로 막대 높이를 다르게 줘 단상처럼 보이게 한다. */}
      <div className={cn('w-full rounded-t-xl', style.barHeight, style.barColor)} />
    </div>
  );
}

export function RankingPodium({ first, second, third }: RankingPodiumProps) {
  return (
    <div className="mx-3 flex items-end gap-3 rounded-2xl bg-white px-5 pt-8 pb-5 shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
      <PodiumSlot entry={second} position={2} />
      <PodiumSlot entry={first} position={1} />
      <PodiumSlot entry={third} position={3} />
    </div>
  );
}
