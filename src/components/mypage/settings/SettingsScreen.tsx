'use client';

import { useMemo, useState } from 'react';

import { FontSizeControl } from '@/components/mypage/settings/FontSizeControl';
import { SettingsInfoRow } from '@/components/mypage/settings/SettingsInfoRow';
import { SettingsToggleRow } from '@/components/mypage/settings/SettingsToggleRow';
import { SETTINGS_ICON } from '@/constants/mypage-settings';
import { usePushSubscription } from '@/hooks/push/use-push-subscription';
import { MOCK_SETTINGS_SECTIONS } from '@/mocks/mypage-settings.mock';
import type { FontSizeOption, SettingsToggleItem } from '@/types/mypage/settings';

// 이 토글만 목업 로컬 상태가 아니라 실제 푸시 구독 여부로 동작한다(usePushSubscription).
// 카테고리별 알림 선호 컬럼이 아직 없어(#116 범위 결정), "구독 여부 = 리마인더 on/off"로 취급한다.
//
// ⚠️ 알려진 한계(#109 리뷰): 브라우저 푸시 구독은 알림 종류와 무관한 단일 공유 자원이다.
// 이 토글을 꺼서 unsubscribe()가 실행되면 아직 목업인 "마스코트 감정 알림" 토글도 실제로는
// 같이 못 받게 된다(그 토글 자체는 로컬 상태만 바뀌어 켜진 채로 보이므로 사용자가 알 방법이 없다).
// 근본 해결(구독은 유지하고 종류별로 별도 플래그 컬럼으로 on/off)은 push_subscriptions 소유자인
// #109 후속 작업(마스코트 감정 알림 구현)에서 처리하기로 함 — 그 전까지의 임시 동작이다.
const LEARNING_REMINDER_ID = 'learning-reminder';

export function SettingsScreen() {
  const FontSizeIcon = SETTINGS_ICON['font-size'];
  const initialToggleState = useMemo(
    () =>
      Object.fromEntries(
        MOCK_SETTINGS_SECTIONS.flatMap((section) =>
          (section.toggles ?? [])
            .filter((item) => item.id !== LEARNING_REMINDER_ID)
            .map((item) => [item.id, item.defaultChecked]),
        ),
      ),
    [],
  );

  const [toggleState, setToggleState] = useState<Record<string, boolean>>(initialToggleState);
  const [fontSize, setFontSize] = useState<FontSizeOption>('medium');
  const [reminderError, setReminderError] = useState<string | null>(null);

  const {
    isSupported: isPushSupported,
    isSubscribed: isReminderOn,
    isBusy: isReminderBusy,
    subscribe: subscribeReminder,
    unsubscribe: unsubscribeReminder,
  } = usePushSubscription();

  const handleToggle = (id: string, checked: boolean) => {
    setToggleState((prev) => ({ ...prev, [id]: checked }));
  };

  const handleReminderToggle = async (checked: boolean) => {
    setReminderError(null);

    try {
      if (checked) {
        // 권한 거부·미지원처럼 "정상적으로 실패한" 경우는 throw 없이 false로 돌아오므로,
        // catch만으론 못 잡는다 — 반환값을 직접 확인해야 토글이 조용히 그대로 남는 걸 막는다.
        const subscribed = await subscribeReminder();

        if (!subscribed) setReminderError('알림 권한이 필요해요. 브라우저 설정에서 허용해주세요.');
      } else {
        await unsubscribeReminder();
      }
    } catch {
      setReminderError('알림 설정을 바꾸지 못했어요. 다시 시도해주세요.');
    }
  };

  return (
    <main className="flex-1 px-5 pb-8">
      {MOCK_SETTINGS_SECTIONS.map((section) => (
        <section key={section.title} className="pb-5">
          <h2 className="text-brown-muted px-1 pb-2 text-xs leading-4 font-bold">
            {section.title}
          </h2>

          {section.toggles && (
            <div className="shadow-card overflow-hidden rounded-2xl bg-white">
              {section.toggles.map((item, index) => {
                const isReminder = item.id === LEARNING_REMINDER_ID;
                const displayItem: SettingsToggleItem = isReminder
                  ? {
                      ...item,
                      description: isPushSupported
                        ? (reminderError ?? item.description)
                        : '이 브라우저는 알림을 지원하지 않아요',
                    }
                  : item;

                return (
                  <SettingsToggleRow
                    key={item.id}
                    item={displayItem}
                    checked={
                      isReminder ? isReminderOn : (toggleState[item.id] ?? item.defaultChecked)
                    }
                    onCheckedChange={
                      isReminder
                        ? handleReminderToggle
                        : (checked) => handleToggle(item.id, checked)
                    }
                    disabled={isReminder && (!isPushSupported || isReminderBusy)}
                    isLast={!section.showFontSize && index === section.toggles!.length - 1}
                  />
                );
              })}

              {section.showFontSize && (
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <span
                    className="bg-blue-soft text-brown-ink flex size-9 shrink-0 items-center justify-center rounded-[14px]"
                    aria-hidden
                  >
                    <FontSizeIcon className="size-4" strokeWidth={2.25} />
                  </span>
                  <p className="text-brown-ink min-w-0 flex-1 text-sm leading-5 font-bold">
                    글자 크기
                  </p>
                  <FontSizeControl value={fontSize} onChange={setFontSize} />
                </div>
              )}
            </div>
          )}

          {section.infoItems && (
            <div className="shadow-card overflow-hidden rounded-2xl bg-white">
              {section.infoItems.map((item, index) => (
                <SettingsInfoRow
                  key={item.id}
                  item={item}
                  isLast={index === section.infoItems!.length - 1}
                />
              ))}
            </div>
          )}
        </section>
      ))}
    </main>
  );
}
