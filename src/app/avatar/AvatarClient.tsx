'use client';

import { useEffect, useState } from 'react';

import { AvatarPreview } from '@/components/avatar/AvatarPreview';
import { CharacterPicker } from '@/components/avatar/CharacterPicker';
import { ColorThemePicker } from '@/components/avatar/ColorThemePicker';
import { Button } from '@/components/common/Button';
import { Footer } from '@/components/common/Footer';
import { Header } from '@/components/common/Header';
import { Toast } from '@/components/common/Toast';
import { selectIsDirty, useAvatarStore } from '@/stores/avatar-store';
import { useUnsavedChangesStore } from '@/stores/unsaved-changes-store';
import type { Avatar } from '@/types/avatar';

import { saveAvatar } from './actions';

interface Feedback {
  variant: 'success' | 'error';
  message: string;
}

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
  // 성공/에러를 단일 상태로 관리해 두 피드백이 동시에 뜨지 않게 한다.
  // 성공은 자동으로 사라지고(Toast 기본 duration), 에러는 다음 저장 전까지 유지(duration 0).
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  // 미저장 변경(dirty)을 전역 플래그에 반영 → Footer 탭 이동 시 이탈 경고에 사용.
  useEffect(() => {
    useUnsavedChangesStore.getState().setHasUnsavedChanges(isDirty);
  }, [isDirty]);

  // 페이지를 떠날 때(언마운트) 플래그를 반드시 해제해 다른 화면에 경고가 새지 않게 한다.
  useEffect(() => {
    return () => useUnsavedChangesStore.getState().setHasUnsavedChanges(false);
  }, []);

  // 새로고침·탭 닫기·외부 이동: dirty일 때만 브라우저 기본 이탈 경고를 띄운다.
  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // 일부 브라우저는 returnValue가 설정돼야 경고를 표시한다.
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleSave = async () => {
    setIsSaving(true);
    setFeedback(null);

    try {
      const result = await saveAvatar({ characterType, colorTheme, nickname });

      if (result.ok) {
        // 저장 성공 → dirty 기준선을 현재 값으로 갱신
        useAvatarStore.getState().initFrom({ characterType, colorTheme, nickname });
        setFeedback({ variant: 'success', message: '저장되었어요!' });
      } else {
        setFeedback({ variant: 'error', message: result.error });
      }
    } catch (error) {
      // 서버 액션 호출 자체가 실패(네트워크/서버 예외)해도 UI가 복구되도록 처리
      console.error('[avatar] 저장 중 오류:', error);
      setFeedback({ variant: 'error', message: '저장 중 오류가 발생했습니다.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    // TODO: 다크모드 도입 시 컨테이너 배경 `dark:bg-neutral-950`
    <div className="bg-linen mx-auto flex min-h-dvh w-full max-w-[430px] flex-col">
      <Header title="아바타" leftType="none" />

      <main className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
        {/* TODO: level은 user_progress 연동 후 실제 값으로 교체 */}
        <AvatarPreview level={5} />
        <ColorThemePicker />
        <CharacterPicker />
      </main>

      {/* TODO: 다크모드 도입 시 하단 바 `dark:bg-neutral-950` */}
      <div className="bg-linen px-4 py-3">
        {/* TODO: 코인 사용 '구매하기'로 전환 예정 */}
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

      <Toast
        isOpen={feedback !== null}
        message={feedback?.message ?? ''}
        variant={feedback?.variant ?? 'success'}
        duration={feedback?.variant === 'error' ? 0 : undefined}
        onClose={() => setFeedback(null)}
        // 저장 바(하단 ~142px)를 가리지 않도록 그 위로 올린다.
        className="bottom-40"
      />
    </div>
  );
}
