'use client';

import { useEffect, useRef, useState } from 'react';

import { Bell, BellOff, BookOpen, Heart, Users, type LucideIcon } from 'lucide-react';

import { cn } from '@/lib/cn';
import { formatRelativeTime } from '@/lib/relative-time';
import { MOCK_NOTIFICATIONS } from '@/mocks/notifications.mock';
import type { NotificationType } from '@/types/notifications';

// 알림 종류별 아이콘·색. 아이콘 배경은 통일하고 아이콘 색으로만 종류를 구분한다.
const TYPE_META: Record<NotificationType, { Icon: LucideIcon; iconClass: string }> = {
  mood: { Icon: Heart, iconClass: 'text-coral' },
  reminder: { Icon: BookOpen, iconClass: 'text-accent-magenta' },
  social: { Icon: Users, iconClass: 'text-accent-green' },
};

// 홈 상단 알림 벨 + 드롭다운 패널. 실제 알림 소스(마스코트 감정 알림 #109 등)가 붙기 전까지
// 목데이터로 UI를 완성한다. 읽음 상태는 로컬(useState) — 영속화는 백엔드 후속.
export function NotificationBell() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);

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
