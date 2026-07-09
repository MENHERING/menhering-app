import { Footer } from '@/components/common/Footer';
import { WrongNoteResultScreen } from '@/components/wrong-note/result/WrongNoteResultScreen';

interface WrongNoteResultPageProps {
  searchParams: Promise<{ queue?: string }>;
}

export default async function WrongNoteResultPage({ searchParams }: WrongNoteResultPageProps) {
  const { queue } = await searchParams;
  const queueIds = queue ? queue.split(',') : [];

  return (
    <div className="bg-linen mx-auto flex min-h-dvh w-full max-w-107.5 flex-col">
      <WrongNoteResultScreen queueIds={queueIds} />
      <Footer />
    </div>
  );
}
