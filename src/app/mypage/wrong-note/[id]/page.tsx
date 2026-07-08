import { notFound } from 'next/navigation';

import { WrongNoteDetailScreen } from '@/components/wrong-note/detail/WrongNoteDetailScreen';
import { MOCK_WRONG_NOTE_ITEMS } from '@/mocks/wrong-note.mock';

interface WrongNoteDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mode?: string; queue?: string; index?: string }>;
}

export default async function WrongNoteDetailPage({
  params,
  searchParams,
}: WrongNoteDetailPageProps) {
  const { id } = await params;
  const { mode, queue, index } = await searchParams;

  const item = MOCK_WRONG_NOTE_ITEMS.find((wrongNoteItem) => wrongNoteItem.id === id);
  if (!item) notFound();

  const isBatchMode = mode === 'batch' && Boolean(queue);
  const queueIds = isBatchMode ? (queue?.split(',') ?? []) : [];
  const currentIndex = Number(index) || 0;
  const isLastInQueue = currentIndex >= queueIds.length - 1;
  const nextId = isBatchMode && !isLastInQueue ? queueIds[currentIndex + 1] : undefined;

  const nextHref = nextId
    ? `/mypage/wrong-note/${nextId}?mode=batch&queue=${queue}&index=${currentIndex + 1}`
    : '/mypage/wrong-note';

  return (
    <div className="bg-linen mx-auto flex min-h-dvh w-full max-w-107.5 flex-col">
      <WrongNoteDetailScreen
        item={item}
        isBatchMode={isBatchMode}
        current={currentIndex + 1}
        total={queueIds.length}
        nextHref={nextHref}
        isLastInQueue={isLastInQueue}
      />
    </div>
  );
}
