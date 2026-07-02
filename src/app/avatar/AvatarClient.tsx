'use client';

import { useState } from 'react';

import { AvatarPreview } from '@/components/avatar/AvatarPreview';
import { CharacterPicker } from '@/components/avatar/CharacterPicker';
import { ColorThemePicker } from '@/components/avatar/ColorThemePicker';
import { Button } from '@/components/common/Button';
import { Footer } from '@/components/common/Footer';
import { Header } from '@/components/common/Header';
import { cn } from '@/lib/cn';
import { selectIsDirty, useAvatarStore } from '@/stores/avatar-store';
import type { Avatar } from '@/types/avatar';

import { saveAvatar } from './actions';

interface AvatarClientProps {
  initialAvatar: Avatar;
}

export function AvatarClient({ initialAvatar }: AvatarClientProps) {
  // 서버 조회값으로 스토어를 최초 1회 동기 초기화 (기본값 플래시 방지).
  // useState 지연 초기화는 마운트당 1회만 실행되며 initFrom은 멱등이라 안전하다.
  useState(() => {
    useAvatarStore.getState().initFrom({
      characterType: initialAvatar.characterType,
      colorTheme: initialAvatar.colorTheme,
      nickname: initialAvatar.nickname,
    });
    return null;
  });

  const characterType = useAvatarStore((s) => s.characterType);
  const colorTheme = useAvatarStore((s) => s.colorTheme);
  const nickname = useAvatarStore((s) => s.nickname);
  const isDirty = useAvatarStore(selectIsDirty);

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    const result = await saveAvatar({ characterType, colorTheme, nickname });

    setIsSaving(false);

    if (result.ok) {
      // 저장 성공 → dirty 기준선을 현재 값으로 갱신
      useAvatarStore.getState().initFrom({ characterType, colorTheme, nickname });
      setMessage({ type: 'success', text: '저장되었어요!' });
    } else {
      setMessage({ type: 'error', text: result.error });
    }
  };

  return (
    <div className="bg-linen mx-auto flex min-h-dvh w-full max-w-[430px] flex-col dark:bg-neutral-950">
      <Header title="아바타" leftType="none" />

      <main className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
        {/* TODO: level은 user_progress 연동 후 실제 값으로 교체 */}
        <AvatarPreview level={5} />
        <ColorThemePicker />
        <CharacterPicker />
      </main>

      <div className="border-cream bg-linen border-t px-4 py-3 dark:border-neutral-800 dark:bg-neutral-950">
        {message && (
          <p
            role="status"
            className={cn(
              'mb-2 text-center text-sm font-semibold',
              message.type === 'success' ? 'text-coral' : 'text-red-500',
            )}
          >
            {message.text}
          </p>
        )}

        <Button
          variant="primary"
          size="lg"
          isFullWidth
          isLoading={isSaving}
          disabled={!isDirty}
          onClick={handleSave}
        >
          저장하기
        </Button>
      </div>

      <Footer />
    </div>
  );
}
