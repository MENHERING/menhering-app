import { Button } from '@/components/common/Button';
import { Section } from '@/components/common/Section';
import type { FriendRequest } from '@/types/mypage/settings';

interface FriendRequestCardProps {
  request: FriendRequest;
  onAccept: () => void;
  onReject: () => void;
}

export function FriendRequestCard({ request, onAccept, onReject }: FriendRequestCardProps) {
  return (
    <Section shadow="sm" className="flex items-center gap-3 p-4">
      <span className="bg-cream-toggle flex size-11 shrink-0 items-center justify-center rounded-full text-2xl leading-8">
        {request.emoji}
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-brown-ink text-sm leading-5 font-bold">{request.name}</p>
        <p className="text-brown-muted text-[11px] leading-[16.5px]">{request.description}</p>
      </div>

      <div className="flex shrink-0 gap-1.5">
        <Button
          size="sm"
          onClick={onAccept}
          className="bg-coral-accent h-auto rounded-[10px] px-3 py-2 text-xs shadow-none"
        >
          수락
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={onReject}
          className="bg-cream-toggle text-brown-muted h-auto rounded-[10px] px-3 py-2 text-xs shadow-none"
        >
          거절
        </Button>
      </div>
    </Section>
  );
}
