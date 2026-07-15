import { WrongNoteDetailScreen } from '@/components/wrong-note/detail/WrongNoteDetailScreen';

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

  const isBatchMode = mode === 'batch' && Boolean(queue);
  const queueIds = isBatchMode ? (queue?.split(',') ?? []) : [id];
  const currentIndex = Number(index) || 0;
  const isLastInQueue = currentIndex >= queueIds.length - 1;
  const nextId = !isLastInQueue ? queueIds[currentIndex + 1] : undefined;

  const nextHref = nextId
    ? `/mypage/wrong-note/${nextId}?mode=batch&queue=${queueIds.join(',')}&index=${currentIndex + 1}`
    : `/mypage/wrong-note/result?queue=${queueIds.join(',')}`;

  return (
    <div className="bg-linen mx-auto flex min-h-dvh w-full max-w-107.5 flex-col">
      <WrongNoteDetailScreen
        id={id}
        isBatchMode={isBatchMode}
        current={currentIndex + 1}
        total={queueIds.length}
        nextHref={nextHref}
        isLastInQueue={isLastInQueue}
      />
    </div>
  );
}
