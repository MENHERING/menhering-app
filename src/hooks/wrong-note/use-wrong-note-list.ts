import { useInfiniteQuery } from '@tanstack/react-query';

import { privateFetch } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import { WrongNoteListSchema } from '@/schemas/wrong-note.schema';

const PAGE_SIZE = 10;

// '더보기' 버튼으로 다음 페이지를 이어받는 커서 기반 목록: nextCursor가 null이면 마지막 페이지
export function useWrongNoteList() {
  return useInfiniteQuery({
    queryKey: queryKeys.wrongNote.list(),
    queryFn: ({ pageParam }: { pageParam: string | null }) => {
      const params = new URLSearchParams({ limit: String(PAGE_SIZE) });

      if (pageParam) {
        params.set('cursor', pageParam);
      }

      return privateFetch(`/api/wrong-note?${params.toString()}`, WrongNoteListSchema);
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}
