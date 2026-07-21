'use client';

import { useState } from 'react';

import { FriendCodeCard } from '@/components/mypage/friends/FriendCodeCard';
import { FriendRequestCard } from '@/components/mypage/friends/FriendRequestCard';
import { FriendSearchInput } from '@/components/mypage/friends/FriendSearchInput';
import { FriendSearchResultCard } from '@/components/mypage/friends/FriendSearchResultCard';
import { useFriendSearch } from '@/hooks/friends/use-friend-search';
import { useMyFriendCode } from '@/hooks/friends/use-my-friend-code';
import { usePendingFriendRequests } from '@/hooks/friends/use-pending-friend-requests';
import { useRespondFriendRequest } from '@/hooks/friends/use-respond-friend-request';
import { useSendFriendRequest } from '@/hooks/friends/use-send-friend-request';

export function FriendAddScreen() {
  const [query, setQuery] = useState('');

  const { data: myCode } = useMyFriendCode();
  const { data: candidates } = useFriendSearch(query);
  const { data: requests } = usePendingFriendRequests();
  const sendMutation = useSendFriendRequest();
  const respondMutation = useRespondFriendRequest();

  const requestCount = requests?.length ?? 0;

  return (
    <main className="flex-1 px-5 pb-6">
      <FriendSearchInput value={query} onChange={setQuery} />

      {candidates && candidates.length > 0 && (
        <div className="mt-3 flex flex-col gap-2">
          {candidates.map((candidate) => (
            <FriendSearchResultCard
              key={candidate.userId}
              candidate={candidate}
              onSendRequest={() => sendMutation.mutate(candidate.userId)}
              isSending={sendMutation.isPending && sendMutation.variables === candidate.userId}
            />
          ))}
        </div>
      )}

      {myCode && <FriendCodeCard code={myCode.code} className="mt-4" />}

      <section className="mt-4">
        <div className="flex items-center gap-2 px-1 pb-2">
          <h2 className="text-brown-ink text-sm leading-5 font-bold">친구 요청</h2>
          {requestCount > 0 && (
            <span className="bg-coral-accent flex size-5 items-center justify-center rounded-full text-[10px] leading-[15px] font-bold text-white">
              {requestCount}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {requests?.map((request) => (
            <FriendRequestCard
              key={request.requestId}
              request={{
                id: request.requestId,
                emoji: '🐼',
                name: request.nickname,
                description: `Lv.${request.level}`,
              }}
              onAccept={() =>
                respondMutation.mutate({ requestId: request.requestId, action: 'accept' })
              }
              onReject={() =>
                respondMutation.mutate({ requestId: request.requestId, action: 'reject' })
              }
            />
          ))}
        </div>

        {requestCount === 0 && (
          <div className="shadow-card rounded-2xl bg-white px-4 py-8 text-center">
            <p className="text-brown-muted text-sm leading-5">받은 친구 요청이 없어요</p>
          </div>
        )}
      </section>
    </main>
  );
}
