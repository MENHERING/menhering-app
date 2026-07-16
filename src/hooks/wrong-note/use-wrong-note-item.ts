import { useQuery } from '@tanstack/react-query';

import { privateFetch } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import { WrongNoteItemSchema } from '@/schemas/wrong-note.schema';

// 오답노트 상세(다시 풀기) 화면에서 단건 조회
export function useWrongNoteItem(id: string) {
  return useQuery({
    queryKey: queryKeys.wrongNote.detail(id),
    queryFn: () => privateFetch(`/api/wrong-note/${id}`, WrongNoteItemSchema),
  });
}
