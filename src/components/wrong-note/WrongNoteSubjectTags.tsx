import { DEFAULT_SUBJECT_STYLE, SUBJECT_STYLE } from '@/constants/wrong-note';
import { cn } from '@/lib/cn';

interface WrongNoteSubjectTagsProps {
  label: string;
}

export function WrongNoteSubjectTags({ label }: WrongNoteSubjectTagsProps) {
  const { bg: subjectBg, text: subjectText } = SUBJECT_STYLE[label] ?? DEFAULT_SUBJECT_STYLE;

  return (
    <div className="flex gap-1.5">
      <span
        className={cn(
          'rounded-full px-2 py-0.5 text-[10px] leading-[15px] font-bold',
          subjectBg,
          subjectText,
        )}
      >
        {label}
      </span>
    </div>
  );
}
