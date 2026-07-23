'use client';

import { useCallback, useEffect, useState } from 'react';

import { privateFetch } from '@/lib/api-client';
import { urlBase64ToUint8Array } from '@/lib/push/vapid';
import { PushSubscribeResultSchema } from '@/schemas/push.schema';

interface PushSubscriptionState {
  // 이 브라우저가 웹 푸시를 지원하는지(서비스워커 + PushManager). iOS Safari 미설치 상태 등은 false.
  isSupported: boolean;
  permission: NotificationPermission;
  isSubscribed: boolean;
  isBusy: boolean;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
}

function checkSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

// navigator.serviceWorker.ready는 SW가 끝내 활성화되지 않으면 무기한 pending이라,
// 유한 타임아웃으로 감싼다. 초과 시 reject되어 호출부의 finally가 실행되고 isBusy가 풀린다.
function serviceWorkerReady(timeoutMs = 10_000): Promise<ServiceWorkerRegistration> {
  return Promise.race([
    navigator.serviceWorker.ready,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('서비스워커 준비 시간이 초과되었습니다.')), timeoutMs);
    }),
  ]);
}

// 브라우저 푸시 구독을 관리한다(권한 요청 → pushManager 구독 → 서버 저장, 역순으로 해제).
// 설정 토글 연동(Phase 2)에서 이 훅을 소비한다.
export function usePushSubscription(): PushSubscriptionState {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    if (!checkSupported()) return;

    // 지원 여부·권한은 SW 활성화와 무관한 브라우저 API 존재 여부라 즉시 반영한다.
    // (SSR/첫 렌더는 false로 시작해 하이드레이션 불일치를 피하고, microtask로 넘겨
    //  effect 본문의 동기 setState를 피한다.) SW가 dev에서 꺼져 있어도 "미지원"으로 고착되지 않는다.
    void Promise.resolve().then(() => {
      setIsSupported(true);
      setPermission(Notification.permission);
    });

    // 기존 구독 여부는 SW가 준비된 뒤에만 알 수 있어 별도로 조회한다(없으면 구독 안 됨으로 둔다).
    serviceWorkerReady()
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => setIsSubscribed(subscription !== null))
      .catch(() => {});
  }, []);

  const subscribe = useCallback(async () => {
    if (!checkSupported()) return;

    setIsBusy(true);

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result !== 'granted') return;

      const registration = await serviceWorkerReady();

      // 기존 구독이 있으면 재사용, 없으면 VAPID 공개키로 새로 구독한다.
      const subscription =
        (await registration.pushManager.getSubscription()) ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY),
        }));

      await privateFetch('/api/push/subscribe', PushSubscribeResultSchema, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription.toJSON()),
      });

      setIsSubscribed(true);
    } finally {
      setIsBusy(false);
    }
  }, []);

  const unsubscribe = useCallback(async () => {
    if (!checkSupported()) return;

    setIsBusy(true);

    try {
      const registration = await serviceWorkerReady();
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await privateFetch('/api/push/subscribe', PushSubscribeResultSchema, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });

        // 서버 행이 지워진 시점에 이미 발송 대상에서 빠지므로, 브라우저 쪽 정리는 best-effort로 둔다.
        // 여기서 던지면 아래 setIsSubscribed(false)를 못 지나가 서버는 해제됐는데 화면만 "켜짐"으로 남는다.
        await subscription.unsubscribe().catch(() => {});
      }

      setIsSubscribed(false);
    } finally {
      setIsBusy(false);
    }
  }, []);

  return { isSupported, permission, isSubscribed, isBusy, subscribe, unsubscribe };
}
