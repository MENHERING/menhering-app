import { RankingListItem } from '@/components/ranking/RankingListItem';
import type { RankingEntry } from '@/types/ranking';

interface RankingListProps {
  entries: RankingEntry[];
}

export function RankingList({ entries }: RankingListProps) {
  return (
    <ul className="flex flex-col gap-3 px-5">
      {entries.map((entry) => (
        <RankingListItem key={entry.userId} entry={entry} />
      ))}
    </ul>
  );
}
