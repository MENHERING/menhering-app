import { cn } from '@/lib/cn';

type Shadow = 'sm' | 'custom' | 'md';

const shadowClasses: Record<Shadow, string> = {
  sm: 'shadow-sm',
  custom: 'shadow-custom',
  md: 'shadow-md',
};

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  shadow?: Shadow;
  isBorder?: boolean;
}

export function Section({ children, className, shadow, isBorder = false }: SectionProps) {
  return (
    <section
      className={cn(
        'mx-auto w-full max-w-7xl rounded-2xl bg-white px-4 sm:px-6 lg:px-8',
        shadow ? shadowClasses[shadow] : undefined,
        isBorder && 'border-cream border',
        className,
      )}
    >
      {children}
    </section>
  );
}
