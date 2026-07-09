'use client';

import { useState } from 'react';

import { FriendCodeCard } from '@/components/mypage/friends/FriendCodeCard';
import { FriendRequestCard } from '@/components/mypage/friends/FriendRequestCard';
import { FriendSearchInput } from '@/components/mypage/friends/FriendSearchInput';
import { MOCK_FRIEND_REQUESTS, MOCK_MY_FRIEND_CODE } from '@/mocks/mypage-settings.mock';

export function FriendAddScreen() {
  const [query, setQuery] = useState('');
  const [requests, setRequests] = useState(MOCK_FRIEND_REQUESTS);

  const handleAccept = (id: string) => {
    setRequests((prev) => prev.filter((request) => request.id !== id));
  };

  const handleReject = (id: string) => {
    setRequests((prev) => prev.filter((request) => request.id !== id));
  };

  return (
    <main className="flex-1 px-5 pb-6">
      <FriendSearchInput value={query} onChange={setQuery} />
      {/* TODO: 코드 생성 로직 추가 */}
      <FriendCodeCard code={MOCK_MY_FRIEND_CODE} className="mt-4" />

      <section className="mt-4">
        <div className="flex items-center gap-2 px-1 pb-2">
          <h2 className="text-brown-ink text-sm leading-5 font-bold">친구 요청</h2>
          {requests.length > 0 && (
            <span className="bg-coral-accent flex size-5 items-center justify-center rounded-full text-[10px] leading-[15px] font-bold text-white">
              {requests.length}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {requests.map((request) => (
            <FriendRequestCard
              key={request.id}
              request={request}
              onAccept={() => handleAccept(request.id)}
              onReject={() => handleReject(request.id)}
            />
          ))}
        </div>

        {requests.length === 0 && (
          <div className="shadow-card rounded-2xl bg-white px-4 py-8 text-center">
            <p className="text-brown-muted text-sm leading-5">받은 친구 요청이 없어요</p>
          </div>
        )}
      </section>
    </main>
  );
}
