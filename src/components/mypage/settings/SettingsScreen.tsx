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
// 카테고리별 알림 선호가 따로 없어(#116 범위 결정), "구독 여부 = 리마인더 on/off"로 취급한다.
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
      await (checked ? subscribeReminder() : unsubscribeReminder());
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
