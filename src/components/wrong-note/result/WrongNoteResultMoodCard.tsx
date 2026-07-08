import { MOOD_ICON } from '@/constants/mood';
import type { Mood } from '@/types/mypage/model';

interface WrongNoteResultMoodCardProps {
  before: Mood;
  after: Mood;
  description: string;
}

export function WrongNoteResultMoodCard({
  before,
  after,
  description,
}: WrongNoteResultMoodCardProps) {
  const BeforeIcon = MOOD_ICON[before];
  const AfterIcon = MOOD_ICON[after];

  return (
    <div className="shadow-card flex w-full items-center gap-3 rounded-2xl bg-white p-4">
      <div className="flex items-center gap-2">
        <div className="flex flex-col items-center">
          <BeforeIcon className="text-brown-ink size-6" aria-hidden />
          <span className="text-brown-muted mt-0.5 text-[10px] leading-[15px]">{before}</span>
        </div>
        <span className="text-brown-muted px-1 text-sm leading-5">→</span>
        <div className="flex flex-col items-center">
          <AfterIcon className="text-brown-ink size-6" aria-hidden />
          <span className="text-brown-muted mt-0.5 text-[10px] leading-[15px]">{after}</span>
        </div>
      </div>
      <div className="bg-coral-accent/15 h-10 w-px shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-brown-ink text-sm leading-5 font-bold">기분 변화</p>
        <p className="text-brown-muted mt-0.5 text-[11px] leading-[16.5px]">{description}</p>
      </div>
    </div>
  );
}
