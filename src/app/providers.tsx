'use client';
import { useState } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { BgmController } from '@/components/common/BgmController';
import { ApiError } from '@/lib/api-error';

// 4xx(잘못된 요청·권한 없음·없는 리소스)는 같은 요청을 다시 보내도 결과가 같으므로 즉시 포기한다.
// ApiError를 name·필드 존재 여부로 덕타이핑하지 않고 instanceof로 판별한다 — 덕타이핑은 필드명이
// 어긋나도(과거 statusCode를 status로 봤다) 타입 검사를 통과해버려, 가드가 조용히 죽어 있었다.
export function queryRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError && error.statusCode >= 400 && error.statusCode < 500) return false;

  return failureCount < 1;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 1000 * 60, retry: queryRetry },
          mutations: {
            retry: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* 전역 배경음악 컨트롤러. 화면 이동에도 언마운트되지 않도록 여기(앱 루트)에 둔다. */}
      <BgmController />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
