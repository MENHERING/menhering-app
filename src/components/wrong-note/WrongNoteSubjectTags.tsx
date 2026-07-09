import { DEFAULT_SUBJECT_STYLE, SUBJECT_STYLE } from '@/constants/wrong-note';
import { cn } from '@/lib/cn';
import type { WrongNoteSubject } from '@/types/wrong-note';

interface WrongNoteSubjectTagsProps {
  subject: WrongNoteSubject;
}

export function WrongNoteSubjectTags({ subject }: WrongNoteSubjectTagsProps) {
  const { bg: subjectBg, text: subjectText } = SUBJECT_STYLE[subject] ?? DEFAULT_SUBJECT_STYLE;

  return (
    <span
      className={cn(
        'rounded-full px-2 py-0.5 text-[10px] leading-[15px] font-bold',
        subjectBg,
        subjectText,
      )}
    >
      {subject}
    </span>
  );
}
