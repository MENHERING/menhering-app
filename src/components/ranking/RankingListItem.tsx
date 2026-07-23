import { CharacterRenderer } from '@/components/avatar/CharacterRenderer';
import { cn } from '@/lib/cn';
import type { RankingEntry } from '@/schemas/ranking.schema';

interface RankingListItemProps {
  entry: RankingEntry;
}

export function RankingListItem({ entry }: RankingListItemProps) {
  return (
    <li
      className={cn(
        'flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-[0_4px_12px_rgba(0,0,0,0.06)]',
        entry.isMe && 'border-coral border-2',
      )}
    >
      <span className="text-brown-soft w-5 shrink-0 text-center text-sm font-bold">
        {entry.rank}
      </span>

      {/* 다른 화면(프로필·홈)의 원형 아바타와 톤을 맞춘다 — 코랄 틴트 배경 대신 흰 배경 + 옅은 링. */}
      <div className="ring-sand-line flex size-11 shrink-0 items-center justify-center rounded-full bg-white ring-2">
        <CharacterRenderer
          characterType={entry.characterType}
          colorTheme={entry.colorTheme}
          className="size-4/5"
        />
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex items-center gap-2">
          <span className="text-ink text-sm font-bold">{entry.nickname}</span>
          {entry.isMe && (
            <span className="bg-coral w-fit shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white">
              나
            </span>
          )}
        </div>

        <span className="text-brown-soft text-xs">
          {entry.isMe
            ? entry.streakDays != null && `${entry.streakDays}일 연속 학습 중`
            : entry.lastActiveLabel}
        </span>
      </div>

      <span className="text-ink text-sm font-bold">{entry.xp.toLocaleString()} XP</span>
    </li>
  );
}
