/// <reference lib="esnext" />
/// <reference lib="webworker" />
import { defaultCache } from '@serwist/turbopack/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { Serwist } from 'serwist';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  fallbacks: {
    entries: [
      {
        url: '/~offline',
        matcher({ request }) {
          return request.destination === 'document';
        },
      },
    ],
  },
});

serwist.addEventListeners();

// 서버 web-push가 보낸 알림을 그린다. 페이로드는 lib/push/server.ts의 PushPayload(JSON).
// JSON이 아니거나(예: DevTools 평문 테스트) 데이터가 없어도 기본값으로 항상 알림을 띄운다.
self.addEventListener('push', (event) => {
  const fallback = { title: '멘헤링', body: '새 알림이 도착했어요', url: '/home' };
  let payload = fallback;

  if (event.data) {
    try {
      payload = { ...fallback, ...(event.data.json() as Partial<typeof fallback>) };
    } catch {
      payload = { ...fallback, body: event.data.text() };
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      data: { url: payload.url },
    }),
  );
});

// 알림 클릭 시 앱을 연다 — 이미 열린 창이 있으면 그 창으로 포커스, 없으면 새로 연다.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = (event.notification.data as { url?: string } | undefined)?.url ?? '/home';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }

      return self.clients.openWindow(targetUrl);
    }),
  );
});
