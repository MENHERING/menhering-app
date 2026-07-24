'use client';

import { useEffect, useRef, useState } from 'react';

import { Bell, BellOff, BookOpen, Heart, Users, type LucideIcon } from 'lucide-react';

import { usePushSubscription } from '@/hooks/push/use-push-subscription';
import { privateFetch } from '@/lib/api-client';
import { cn } from '@/lib/cn';
import { formatRelativeTime } from '@/lib/relative-time';
import { MOCK_NOTIFICATIONS } from '@/mocks/notifications.mock';
import { PushTestResultSchema } from '@/schemas/push.schema';
import type { NotificationType } from '@/types/notifications';

// 알림 종류별 아이콘·색. 아이콘 배경은 통일하고 아이콘 색으로만 종류를 구분한다.
const TYPE_META: Record<NotificationType, { Icon: LucideIcon; iconClass: string }> = {
  mood: { Icon: Heart, iconClass: 'text-coral' },
  reminder: { Icon: BookOpen, iconClass: 'text-plum' },
  social: { Icon: Users, iconClass: 'text-green-accent' },
};

// 켜기 버튼을 눌러도 소용없는 경우에만 안내 문구를 돌려준다(null이면 토글을 그린다).
// 권한이 denied면 브라우저가 재요청 자체를 막으므로 버튼을 보여주면 안 된다.
// 미지원의 대부분은 iOS Safari 탭 — 웹 푸시가 홈 화면에 추가한 PWA에서만 동작해서다.
function getPushNotice(isSupported: boolean, permission: NotificationPermission): string | null {
  if (!isSupported)
    return '이 브라우저에서는 알림을 받을 수 없어요. iPhone은 홈 화면에 추가하면 받을 수 있어요.';
  if (permission === 'denied') return '브라우저 설정에서 알림을 허용하면 받을 수 있어요.';

  return null;
}

// 홈 상단 알림 벨 + 드롭다운 패널. 실제 알림 소스(마스코트 감정 알림 #109 등)가 붙기 전까지
// 목데이터로 UI를 완성한다. 읽음 상태는 로컬(useState) — 영속화는 백엔드 후속.
// 패널 상단의 기기 알림 토글만 목업이 아니라 실제 푸시 구독(#109)과 연결돼 있다.
export function NotificationBell() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [isOpen, setIsOpen] = useState(false);
  const [pushError, setPushError] = useState<string | null>(null);
  // 테스트 발송 결과 안내. 성공/실패 모두 이 자리에 문구로 보여준다.
  const [testMessage, setTestMessage] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);

  const {
    isSupported: isPushSupported,
    permission,
    isSubscribed: isPushOn,
    isBusy: isPushBusy,
    subscribe,
    unsubscribe,
  } = usePushSubscription();

  const pushNotice = getPushNotice(isPushSupported, permission);

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  // 패널 밖 클릭·Esc로 닫는다. 열려 있을 때만 리스너를 건다.
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;

      setIsOpen(false);
      // Esc로 닫으면 포커스가 body로 흩어져 키보드 사용자가 위치를 잃는다. 트리거(벨)로 되돌린다.
      bellRef.current?.focus();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, isRead: true } : notification,
      ),
    );
  };

  const handleReadAll = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })));
  };

  // 권한 거부처럼 "정상적으로 실패한" 경우는 훅이 throw하지 않고 permission만 갱신하므로,
  // 화면은 getPushNotice가 알아서 안내 문구로 바뀐다. catch는 진짜 오류(네트워크·저장 실패)용이다.
  const handlePushToggle = async () => {
    setPushError(null);
    setTestMessage(null);

    try {
      if (isPushOn) {
        await unsubscribe();
      } else {
        await subscribe();
      }
    } catch {
      setPushError('알림 설정을 바꾸지 못했어요. 잠시 후 다시 시도해주세요.');
    }
  };

  // 알림을 켜도 OS 알림 설정이 꺼져 있으면 아무 일도 안 일어나서, 사용자가 켜졌는지 알 방법이 없다.
  // 본인 구독에만 한 건 보내 실제로 도착하는지 직접 확인하게 한다.
  const handleTestSend = async () => {
    setPushError(null);
    setTestMessage(null);
    setIsTesting(true);

    try {
      await privateFetch('/api/push/test', PushTestResultSchema, { method: 'POST' });
      setTestMessage('보냈어요! 잠시 후 알림이 도착해요.');
    } catch {
      setTestMessage('보내지 못했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={bellRef}
        type="button"
        aria-label={unreadCount > 0 ? `알림 ${unreadCount}개` : '알림'}
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative flex size-10 items-center justify-center rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] active:opacity-70"
      >
        <Bell className="text-coral size-5" aria-hidden />
        {unreadCount > 0 && (
          <span
            className="bg-coral absolute top-2 right-2 size-2 rounded-full ring-2 ring-white"
            aria-hidden
          />
        )}
      </button>

      {isOpen && (
        <div className="border-cream absolute top-full right-0 z-50 mt-2 w-80 max-w-[calc(100vw-3rem)] overflow-hidden rounded-2xl border bg-white shadow-lg">
          <div className="border-cream flex items-center justify-between border-b px-4 py-3">
            <span className="text-plum text-sm font-extrabold">알림</span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleReadAll}
                className="text-brown-soft hover:text-coral text-xs font-bold transition-colors"
              >
                모두 읽음
              </button>
            )}
          </div>

          {/* 기기 알림(웹 푸시) on/off. 아래 목록은 앱을 열어야 보이므로, 앱을 닫은 동안에도
              받으려면 브라우저 구독을 따로 켜야 한다. */}
          <div className="border-cream bg-sand/40 border-b px-4 py-3">
            {pushNotice ? (
              <p className="text-brown-soft text-[11px] leading-relaxed">{pushNotice}</p>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <span className="text-plum text-xs font-bold">
                  {isPushOn ? '기기 알림 켜짐' : '앱을 닫아도 알림 받기'}
                </span>
                <button
                  type="button"
                  onClick={handlePushToggle}
                  disabled={isPushBusy}
                  className={cn(
                    'shrink-0 rounded-full px-3 py-1 text-xs font-bold transition-colors disabled:opacity-50',
                    isPushOn ? 'text-brown-soft bg-black/5' : 'bg-coral text-white',
                  )}
                >
                  {isPushBusy ? '처리 중' : isPushOn ? '끄기' : '켜기'}
                </button>
              </div>
            )}

            {/* 켜져 있을 때만 노출. 알림을 켜도 OS 알림 설정이 꺼져 있으면 아무 일도 일어나지 않아
                사용자가 제대로 켜졌는지 알 수 없어서, 직접 한 건 받아볼 수단을 둔다. */}
            {isPushOn && (
              <button
                type="button"
                onClick={handleTestSend}
                disabled={isTesting}
                className="text-brown-soft hover:text-coral mt-2 text-[11px] font-bold underline underline-offset-2 transition-colors disabled:opacity-50"
              >
                {isTesting ? '보내는 중…' : '알림 잘 오는지 확인하기'}
              </button>
            )}

            {testMessage && <p className="text-brown-soft mt-1.5 text-[11px]">{testMessage}</p>}
            {pushError && <p className="text-coral mt-1.5 text-[11px]">{pushError}</p>}
          </div>

          {notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-1 px-4 py-10 text-center">
              <BellOff className="text-brown-soft/40 size-8" aria-hidden />
              <p className="text-plum text-sm font-bold">아직 알림이 없어요</p>
              <p className="text-brown-soft text-xs">학습하면 소식이 도착해요!</p>
            </div>
          ) : (
            <ul className="divide-cream max-h-96 divide-y overflow-y-auto">
              {notifications.map((notification) => {
                const { Icon, iconClass } = TYPE_META[notification.type];

                return (
                  <li key={notification.id}>
                    <button
                      type="button"
                      onClick={() => handleRead(notification.id)}
                      className="hover:bg-sand/50 flex w-full items-start gap-3 px-4 py-3 text-left transition-colors"
                    >
                      <span className="bg-coral-soft/40 mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full">
                        <Icon className={cn('size-4', iconClass)} aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5">
                          <span
                            className={cn(
                              'truncate text-sm font-bold',
                              notification.isRead ? 'text-brown-soft' : 'text-plum',
                            )}
                          >
                            {notification.title}
                          </span>
                          {!notification.isRead && (
                            <span className="bg-coral size-1.5 shrink-0 rounded-full" aria-hidden />
                          )}
                        </span>
                        <span className="text-brown-soft mt-0.5 line-clamp-1 text-xs">
                          {notification.body}
                        </span>
                        <span className="text-brown-soft/70 mt-1 block text-[11px] font-medium">
                          {formatRelativeTime(notification.createdAt)}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
