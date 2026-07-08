'use client';

import { type MouseEvent } from 'react';

import { BookOpen, Home, Shirt, UserRound, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/cn';
import { useUnsavedChangesStore } from '@/stores/unsaved-changes-store';

interface NavItem {
  label: string;
  href: string;
  Icon: LucideIcon;
}

// 아이콘은 디자인 확정 시 교체 가능
const NAV_ITEMS: NavItem[] = [
  { label: '홈', href: ROUTES.HOME, Icon: Home },
  { label: '학습', href: ROUTES.LEARNING, Icon: BookOpen },
  { label: '아바타', href: ROUTES.AVATAR, Icon: Shirt },
  { label: '마이페이지', href: ROUTES.MYPAGE, Icon: UserRound },
];

// 홈은 정확히 일치, 나머지는 하위 경로(예: /learning/stage/3)까지 활성 처리.
// startsWith에 '/'를 붙여 형제 경로(예: /avatar-settings)가 /avatar로 오탐되지 않게 한다.
function isActiveTab(pathname: string, href: string) {
  if (href === ROUTES.HOME) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface FooterProps {
  /** nav 요소에 병합할 추가 클래스 (예: 그림자, z-index/여백 조정) */
  className?: string;
}

/**
 * 앱 하단 탭 내비게이션(공용).
 *
 * 마운트 계약: `sticky bottom-0`으로 하단 고정하므로, 소비 측 레이아웃을
 * `flex min-h-dvh flex-col` 컨테이너로 감싸고 Footer를 마지막 자식으로 두세요.
 * (본문에는 `flex-1`을 주어 Footer를 아래로 밀어냄)
 *
 * @example
 * <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col">
 *   <main className="flex-1">{children}</main>
 *   <Footer />
 * </div>
 */
export function Footer({ className }: FooterProps) {
  const pathname = usePathname();

  // 미저장 변경이 있는 화면(예: 아바타 탭)에서 다른 탭으로 이동 시 이탈 경고.
  // 현재 탭(활성) 재클릭은 이탈이 아니므로 통과한다.
  const handleNavClick = (event: MouseEvent<HTMLAnchorElement>, isActive: boolean) => {
    if (isActive) return;
    if (!useUnsavedChangesStore.getState().hasUnsavedChanges) return;

    const canLeave = window.confirm('저장하지 않은 변경이 있어요. 나가시겠어요?');

    if (!canLeave) {
      // Link는 defaultPrevented면 클라이언트 내비게이션을 건너뛴다.
      event.preventDefault();
      return;
    }

    // 나가기로 확정 → 플래그는 여기서 선제 해제하지 않는다.
    // AvatarClient 언마운트 cleanup이 해제하므로, 네비게이션이 중단돼 화면에 남는 경우에도
    // 경고가 꺼진 채로 남지 않는다.
  };

  return (
    <nav
      aria-label="하단 탭 내비게이션"
      className={cn(
        // TODO: 다크모드 도입 시 `dark:border-neutral-800 dark:bg-neutral-900` 추가
        'border-cream sticky bottom-0 z-20 grid grid-cols-4 border-t bg-white pb-[env(safe-area-inset-bottom)]',
        className,
      )}
    >
      {NAV_ITEMS.map(({ label, href, Icon }) => {
        const active = isActiveTab(pathname, href);

        return (
          <Link
            key={href}
            href={href}
            onClick={(event) => handleNavClick(event, active)}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex flex-col items-center gap-1 py-1.5 text-xs font-bold transition-colors',
              // 탭 누르는 순간 피드백(모바일 탭 하이라이트)
              'active:opacity-70',
              // TODO: 다크모드 도입 시 비활성 탭 `dark:text-neutral-400`
              active ? 'text-coral' : 'text-brown-soft',
            )}
          >
            <span
              className={cn(
                'flex size-8 items-center justify-center rounded-full transition-colors',
                // TODO: 다크모드 도입 시 활성 탭 원형 배경 `dark:bg-coral/20`
                active && 'bg-coral-soft',
              )}
            >
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
