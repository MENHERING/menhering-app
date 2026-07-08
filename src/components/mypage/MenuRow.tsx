import { ChevronRight, NotebookPen, Settings, LogOut, type LucideIcon } from 'lucide-react';

import { Section } from '@/components/common/Section';
import { cn } from '@/lib/cn';
import type { MenuIcon } from '@/types/mypage/model';

interface MenuRowProps {
  icon: MenuIcon;
  title: string;
  description?: string;
  trailing?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const ROW_ICON: Record<MenuIcon, { bg: string; Icon: LucideIcon }> = {
  note: { bg: 'bg-blue-soft', Icon: NotebookPen },
  setting: { bg: 'none', Icon: Settings },
  logout: { bg: 'none', Icon: LogOut },
};

export function MenuRow({ icon, title, description, trailing, className, onClick }: MenuRowProps) {
  const { bg, Icon } = ROW_ICON[icon];

  const content = (
    <>
      <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-full', bg)}>
        {Icon === NotebookPen ? <Icon className="size-4" /> : <Icon className="size-5" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-brown-ink text-sm leading-5 font-bold">{title}</p>
        {description ? (
          <p className="text-brown-muted text-[11px] leading-[16.5px]">{description}</p>
        ) : null}
      </div>
      {trailing ?? (
        <span className="text-brown-muted text-base leading-6" aria-hidden>
          <ChevronRight className="size-4" />
        </span>
      )}
    </>
  );

  const rowClassName = cn('flex w-full items-center gap-3 px-4 py-3.5 text-left', className);

  if (onClick) {
    return (
      <Section shadow="sm" className="p-0">
        <button type="button" onClick={onClick} className={rowClassName}>
          {content}
        </button>
      </Section>
    );
  }

  return (
    <Section shadow="sm" className="p-0">
      <div className={rowClassName}>{content}</div>
    </Section>
  );
}
