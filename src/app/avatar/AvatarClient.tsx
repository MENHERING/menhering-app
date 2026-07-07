'use client';

import { useEffect, useState } from 'react';

import { AvatarPreview } from '@/components/avatar/AvatarPreview';
import { CharacterPicker } from '@/components/avatar/CharacterPicker';
import { ColorThemePicker } from '@/components/avatar/ColorThemePicker';
import { Button } from '@/components/common/Button';
import { CoinBadge } from '@/components/common/CoinBadge';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { Footer } from '@/components/common/Footer';
import { Header } from '@/components/common/Header';
import { Toast } from '@/components/common/Toast';
import { useAvatarEconomyStore } from '@/stores/avatar-economy-store';
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

  // 코인/보유는 클라이언트 데모 스토어(새로고침 시 리셋). TODO: 서버(users.coin+보유)로 교체.
  const coin = useAvatarEconomyStore((s) => s.coin);
  const pendingBuy = useAvatarEconomyStore((s) => s.pendingBuy);
  const confirmBuy = useAvatarEconomyStore((s) => s.confirmBuy);
  const cancelBuy = useAvatarEconomyStore((s) => s.cancelBuy);

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

  // 구매 확정: 결제가 성공한 경우에만 산 항목을 장착 후보로 선택한다(실제 장착은 저장에서).
  // 결제 실패(잔액 부족 등) 시엔 장착하지 않아 "안 산 항목이 장착되는" 어긋남을 막는다.
  const handleConfirmBuy = () => {
    const buy = pendingBuy;
    if (!buy) return;

    if (!confirmBuy()) return;

    if (buy.kind === 'character') {
      useAvatarStore.getState().setCharacterType(buy.value);
    } else {
      useAvatarStore.getState().setColorTheme(buy.value);
    }
  };

  const canAfford = pendingBuy ? coin >= pendingBuy.cost : false;

  return (
    // TODO: 다크모드 도입 시 컨테이너 배경 `dark:bg-neutral-950`
    <div className="bg-linen mx-auto flex min-h-dvh w-full max-w-[430px] flex-col">
      <Header
        title="아바타"
        leftType="none"
        // 코인 잔액(헤더 우측). TODO: users.coin 실조회로 교체(auth 후)
        rightElement={<CoinBadge amount={coin} />}
      />

      <main className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
        {/* TODO: level은 user_progress 연동 후 실제 값으로 교체 */}
        <AvatarPreview level={5} />
        <ColorThemePicker />
        <CharacterPicker />
      </main>

      {/* TODO: 다크모드 도입 시 하단 바 `dark:bg-neutral-950` */}
      <div className="bg-linen px-4 py-3">
        {/* 장착(저장). 구매는 각 카드에서 개별 진행. TODO: 실제 저장/구매는 auth·DB 후. */}
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
        // auth 필수 안내(에러)는 스스로 닫으면 안 되므로 성공 토스트에만 X 노출
        dismissible={feedback?.variant === 'success'}
        onClose={() => setFeedback(null)}
        // 저장 바(하단 ~142px)를 가리지 않도록 그 위로 올린다.
        className="bottom-40"
      />

      <ConfirmModal
        isOpen={pendingBuy !== null}
        title="구매하시겠어요?"
        highlight={pendingBuy ? <CoinBadge amount={pendingBuy.cost} /> : undefined}
        description={
          canAfford ? '구매하면 계속 보유하고 무료로 사용할 수 있어요.' : '코인이 부족해요.'
        }
        confirmLabel="구매"
        confirmDisabled={!canAfford}
        onConfirm={handleConfirmBuy}
        onCancel={cancelBuy}
      />
    </div>
  );
}
