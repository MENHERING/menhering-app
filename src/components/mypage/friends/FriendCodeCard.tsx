'use client';

import { useState } from 'react';

import { Button } from '@/components/common/Button';
import { Section } from '@/components/common/Section';
import { cn } from '@/lib/cn';

interface FriendCodeCardProps {
  code: string;
  className?: string;
}

const COPIED_LABEL_DURATION_MS = 1500;

export function FriendCodeCard({ code, className }: FriendCodeCardProps) {
  const [isCopied, setIsCopied] = useState(false);

  // TODO : 로직 레벨 분리 필요
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), COPIED_LABEL_DURATION_MS);
    } catch {
      // 클립보드 API 미지원 환경에서는 UI만 제공한다.
    }
  };

  return (
    <Section shadow="sm" className={cn('flex items-center gap-3 p-4', className)}>
      <div className="border-coral/15 bg-linen flex size-12 shrink-0 flex-col items-center justify-center rounded-[14px] border-2 border-dashed">
        <span className="text-brown-ink text-[11px] leading-none font-bold">판다</span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-brown-muted text-[11px] leading-[16.5px]">내 코드</p>
        <p className="text-coral-accent text-lg leading-7 font-bold">{code}</p>
      </div>

      <Button
        variant={isCopied ? 'primary' : 'outline'}
        size="sm"
        onClick={handleCopy}
        className="shrink-0 transition-colors duration-300"
      >
        {isCopied ? '복사됨' : '복사'}
      </Button>
    </Section>
  );
}
