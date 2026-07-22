import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

interface SpeechBubbleProps {
  children: ReactNode;
  /** 글자 크기. 기본 sm(홈 인사말). 아바타 탭 대사처럼 강조가 필요하면 md. */
  size?: 'sm' | 'md';
}

/**
 * 캐릭터 위에 뜨는 흰 말풍선(coral 테두리 + 아래쪽 꼬리). 홈 화면과 아바타 탭이 공유한다.
 * 내용(닉네임 인사·감정 대사 등)은 children으로 주입받고, 여기서는 모양만 담당한다.
 *
 * 바깥 여백·정렬(mt/flex justify-center)은 호출부마다 달라 여기 두지 않는다.
 */
export function SpeechBubble({ children, size = 'sm' }: SpeechBubbleProps) {
  return (
    <div className="border-coral/30 relative rounded-full border-2 bg-white px-5 py-2.5 shadow-sm">
      <p
        className={cn(
          'text-plum flex items-center gap-1 font-bold',
          size === 'md' ? 'text-base' : 'text-sm',
        )}
      >
        {children}
      </p>
      <span className="border-coral/30 absolute -bottom-1.5 left-1/2 size-3 -translate-x-1/2 rotate-45 border-r-2 border-b-2 bg-white" />
    </div>
  );
}
