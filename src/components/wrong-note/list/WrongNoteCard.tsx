'use client';

import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/common/Button';
import { Section } from '@/components/common/Section';
import { WrongNoteOptionRow } from '@/components/wrong-note/list/WrongNoteOptionRow';
import { WrongNoteSubjectTags } from '@/components/wrong-note/WrongNoteSubjectTags';
import { cn } from '@/lib/cn';
import { formatRelativeTime } from '@/lib/date/format-relative-time';
import type { WrongNoteItem } from '@/types/wrong-note';

interface WrongNoteCardProps {
  item: WrongNoteItem;
}

export function WrongNoteCard({ item }: WrongNoteCardProps) {
  const router = useRouter();
  const isReviewed = item.reviewStatus === 'reviewed';

  return (
    <Section className="shadow-card p-4">
      <div className="flex items-center justify-between">
        <WrongNoteSubjectTags label={item.label} />
        <span className="text-brown-muted text-[10px] leading-[15px]">
          {formatRelativeTime(item.createdAt)}
        </span>
      </div>

      <p className="text-brown-ink mt-2.5 text-sm leading-5.5 font-bold">Q. {item.question}</p>

      <div className="mt-3 flex flex-col gap-2">
        {item.options.map((option) => (
          <WrongNoteOptionRow key={option.number} option={option} />
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span
          className={cn(
            'flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] leading-4.5 font-bold',
            isReviewed
              ? 'bg-answer-correct-soft text-answer-correct'
              : 'bg-coral-tint text-coral-accent',
          )}
        >
          {isReviewed && <Check className="size-3" strokeWidth={3} aria-hidden />}
          {isReviewed ? '복습 완료' : '미복습'}
        </span>
        {!isReviewed && (
          <Button
            size="sm"
            className="bg-coral-accent shadow-none"
            onClick={() => router.push(`/mypage/wrong-note/${item.id}`)}
          >
            다시 풀기
          </Button>
        )}
      </div>
    </Section>
  );
}
