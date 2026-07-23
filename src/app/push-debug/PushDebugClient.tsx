'use client';

import { useState } from 'react';

import { Button } from '@/components/common/Button';
import { usePushSubscription } from '@/hooks/push/use-push-subscription';
import { privateFetch } from '@/lib/api-client';
import { PushTestResultSchema } from '@/schemas/push.schema';

// Phase 1 검증 전용 하네스 — 구독 → 저장 → 테스트 발송까지 브라우저에서 눈으로 확인한다.
// 실제 설정 토글 연동은 Phase 2, 이 페이지는 그 전까지의 임시 도구다.
export function PushDebugClient() {
  const { isSupported, permission, isSubscribed, isBusy, subscribe, unsubscribe } =
    usePushSubscription();
  const [message, setMessage] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  // 구독/해제는 훅에서 실패 시 throw하므로, 여기서 잡아 사용자에게 표면화한다.
  const handleSubscribe = async () => {
    setMessage(null);

    try {
      await subscribe();
    } catch {
      setMessage('구독 실패 — 알림 권한과 콘솔을 확인하세요.');
    }
  };

  const handleUnsubscribe = async () => {
    setMessage(null);

    try {
      await unsubscribe();
    } catch {
      setMessage('구독 해제 실패 — 콘솔을 확인하세요.');
    }
  };

  const handleTest = async () => {
    setMessage(null);
    setIsTesting(true);

    try {
      const result = await privateFetch('/api/push/test', PushTestResultSchema, { method: 'POST' });
      setMessage(`발송 ${result.sent}건 / 만료 정리 ${result.pruned}건`);
    } catch {
      setMessage('테스트 발송 실패 — 구독 상태와 콘솔을 확인하세요.');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col gap-4 px-6 py-10">
      <h1 className="text-plum text-2xl font-extrabold">푸시 디버그 (Phase 1)</h1>

      <dl className="grid grid-cols-2 gap-2 rounded-2xl bg-white p-4 text-sm">
        <dt className="text-brown-soft font-bold">지원 여부</dt>
        <dd>{isSupported ? '지원' : '미지원(설치 PWA 아님/미지원 브라우저)'}</dd>
        <dt className="text-brown-soft font-bold">알림 권한</dt>
        <dd>{permission}</dd>
        <dt className="text-brown-soft font-bold">구독 상태</dt>
        <dd>{isSubscribed ? '구독됨' : '구독 안 됨'}</dd>
      </dl>

      <div className="flex flex-col gap-3">
        {isSubscribed ? (
          <Button
            variant="secondary"
            isFullWidth
            disabled={isBusy || isTesting}
            onClick={handleUnsubscribe}
          >
            구독 해제
          </Button>
        ) : (
          <Button
            variant="primary"
            isFullWidth
            disabled={!isSupported || isBusy || isTesting}
            onClick={handleSubscribe}
          >
            알림 구독
          </Button>
        )}

        <Button
          variant="primary"
          isFullWidth
          disabled={!isSubscribed || isBusy || isTesting}
          onClick={handleTest}
        >
          나에게 테스트 발송
        </Button>
      </div>

      {message && <p className="text-plum text-center text-sm font-bold">{message}</p>}
    </div>
  );
}
