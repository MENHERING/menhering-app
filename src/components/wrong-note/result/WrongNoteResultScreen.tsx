'use client';

import { PartyPopper, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/common/Button';
import { WrongNoteResultMoodCard } from '@/components/wrong-note/result/WrongNoteResultMoodCard';
import { WrongNoteResultStatsCard } from '@/components/wrong-note/result/WrongNoteResultStatsCard';
import { WrongNoteResultStreakCard } from '@/components/wrong-note/result/WrongNoteResultStreakCard';
import { DEFAULT_MOOD_VALUE } from '@/constants/avatar';
import { moodFromValue } from '@/constants/mood';
import { useWrongNoteStore } from '@/stores/wrong-note-store';

// 보상은 항상 유지되거나 증가하므로 "악화" 케이스는 없다.
function getMoodDescription(before: number, after: number): string {
  if (after > before) return '학습으로 기분이 좋아졌어요';
  return '꾸준히 기분을 유지했어요';
}

interface WrongNoteResultScreenProps {
  queueIds: string[];
}

export function WrongNoteResultScreen({ queueIds }: WrongNoteResultScreenProps) {
  const router = useRouter();
  const { firstTryCorrectMap, totalXpEarned, moodBefore, moodAfter, streak } = useWrongNoteStore(
    (state) => state,
  );

  const total = queueIds.length;
  const correct = queueIds.filter((id) => firstTryCorrectMap[id]).length;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const xp = totalXpEarned;

  const moodBeforeValue = moodBefore ?? DEFAULT_MOOD_VALUE;
  const moodAfterValue = moodAfter ?? moodBeforeValue;
  const streakDays = streak ?? 0;

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-8">
      <div className="relative size-32">
        <div className="drop-shadow-mascot absolute inset-0 rounded-full bg-[linear-gradient(135deg,var(--mascot-glow-start)_0%,var(--mascot-glow-end)_100%)] p-[3px]">
          <div className="bg-answer-correct-soft relative size-full overflow-hidden rounded-full">
            <Image
              src="/mascot/red-panda.png"
              alt="레서판다 마스코트"
              fill
              sizes="128px"
              className="object-contain"
            />
          </div>
        </div>
        <Sparkles
          className="text-gold animate-sparkle-shine absolute -top-2 right-2 size-4"
          aria-hidden
        />
        <Sparkles
          className="text-gold animate-sparkle-shine absolute bottom-6 -left-2 size-3.5 [animation-delay:0.5s]"
          aria-hidden
        />
      </div>

      <div className="flex flex-col items-center gap-1">
        <h1 className="text-brown-ink flex items-center gap-1.5 text-2xl leading-8 font-bold">
          {total}문제 완료!
          <PartyPopper className="text-coral-accent size-6" aria-hidden />
        </h1>
        <p className="text-brown-muted text-sm leading-5">레서판다가 신나서 결승선까지 달렸어요</p>
      </div>

      <WrongNoteResultStatsCard correct={correct} total={total} xp={xp} accuracy={accuracy} />
      <WrongNoteResultMoodCard
        before={moodFromValue(moodBeforeValue)}
        after={moodFromValue(moodAfterValue)}
        description={getMoodDescription(moodBeforeValue, moodAfterValue)}
      />
      <WrongNoteResultStreakCard streakDays={streakDays} />

      <Button
        isFullWidth
        size="lg"
        className="bg-coral-accent mt-22"
        onClick={() => router.replace('/mypage/wrong-note')}
      >
        완료
      </Button>
    </main>
  );
}
