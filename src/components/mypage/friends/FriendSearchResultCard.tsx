import { Button } from '@/components/common/Button';
import { Section } from '@/components/common/Section';
import type { FriendCandidate } from '@/schemas/friend.schema';

interface FriendSearchResultCardProps {
  candidate: FriendCandidate;
  onSendRequest: () => void;
  isSending?: boolean;
}

const STATUS_LABEL: Record<Exclude<FriendCandidate['requestStatus'], 'NONE'>, string> = {
  PENDING_SENT: '요청됨',
  PENDING_RECEIVED: '요청 받음',
  FRIEND: '친구',
};

export function FriendSearchResultCard({
  candidate,
  onSendRequest,
  isSending,
}: FriendSearchResultCardProps) {
  const { nickname, level, requestStatus } = candidate;

  return (
    <Section shadow="sm" className="flex items-center gap-3 p-4">
      {/* TODO: characterType/colorTheme 기반 실제 아바타 아이콘으로 교체 */}
      <span className="bg-cream-toggle flex size-11 shrink-0 items-center justify-center rounded-full text-2xl leading-8">
        🐼
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-brown-ink text-sm leading-5 font-bold">{nickname}</p>
        <p className="text-brown-muted truncate text-[11px] leading-[16.5px]">Lv.{level}</p>
      </div>

      {requestStatus === 'NONE' ? (
        <Button
          size="sm"
          onClick={onSendRequest}
          isLoading={isSending}
          className="bg-coral-accent h-auto shrink-0 rounded-[10px] px-3 py-2 text-xs shadow-none"
        >
          요청 보내기
        </Button>
      ) : (
        <span className="text-brown-muted shrink-0 text-[11px] font-semibold">
          {STATUS_LABEL[requestStatus]}
        </span>
      )}
    </Section>
  );
}
