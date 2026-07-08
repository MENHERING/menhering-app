import { Trophy, UsersRound, ChevronRight, type LucideIcon } from 'lucide-react';

import { Section } from '@/components/common/Section';
import { cn } from '@/lib/cn';
import type { FriendItem, FriendItemKind } from '@/types/mypage/model';

interface FriendsSectionProps {
  items: FriendItem[];
}

const FRIEND_ITEM_STYLE: Record<FriendItemKind, { bg: string; Icon: LucideIcon }> = {
  ranking: { bg: 'bg-yellow-soft', Icon: Trophy },
  add: { bg: 'bg-green-soft', Icon: UsersRound },
};

export function FriendsSection({ items }: FriendsSectionProps) {
  return (
    <section className="px-5 pt-4">
      <div className="flex items-center gap-2 px-1 pb-2">
        <h3 className="text-brown-ink text-sm leading-5 font-bold">친구</h3>
        <span className="bg-coral rounded-full px-2 py-0.5 text-[10px] leading-[15px] font-bold text-white">
          출시 예정
        </span>
      </div>

      <Section shadow="sm" className="overflow-hidden p-0">
        {items.map((item, index) => {
          const { bg, Icon } = FRIEND_ITEM_STYLE[item.kind];

          return (
            <div
              key={item.title}
              className={cn(
                'flex items-center gap-3 px-4 py-3.5',
                index < items.length - 1 && 'border-coral/15 border-b',
              )}
            >
              <span
                className={cn('flex size-9 shrink-0 items-center justify-center rounded-full', bg)}
              >
                <Icon className="text-brown-ink size-4" aria-hidden />
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-brown-ink text-sm leading-5 font-bold">{item.title}</p>
                <p className="text-brown-muted text-[11px] leading-[16.5px]">{item.description}</p>
              </div>

              <span className="bg-coral shrink-0 rounded-full px-2.5 py-1 text-[11px] leading-[16.5px] font-bold text-white">
                {item.badge}
              </span>

              <span className="text-brown-muted shrink-0 text-base leading-6" aria-hidden>
                <ChevronRight className="size-4" aria-hidden />
              </span>
            </div>
          );
        })}
      </Section>
    </section>
  );
}
