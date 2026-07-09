'use client';

import { useMemo, useState } from 'react';

import { FontSizeControl } from '@/components/mypage/settings/FontSizeControl';
import { SettingsInfoRow } from '@/components/mypage/settings/SettingsInfoRow';
import { SettingsToggleRow } from '@/components/mypage/settings/SettingsToggleRow';
import { SETTINGS_ICON } from '@/constants/mypage-settings';
import { MOCK_SETTINGS_SECTIONS } from '@/mocks/mypage-settings.mock';
import type { FontSizeOption } from '@/types/mypage/settings';

export function SettingsScreen() {
  const FontSizeIcon = SETTINGS_ICON['font-size'];
  const initialToggleState = useMemo(
    () =>
      Object.fromEntries(
        MOCK_SETTINGS_SECTIONS.flatMap((section) =>
          (section.toggles ?? []).map((item) => [item.id, item.defaultChecked]),
        ),
      ),
    [],
  );

  const [toggleState, setToggleState] = useState<Record<string, boolean>>(initialToggleState);
  const [fontSize, setFontSize] = useState<FontSizeOption>('medium');

  const handleToggle = (id: string, checked: boolean) => {
    setToggleState((prev) => ({ ...prev, [id]: checked }));
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
              {section.toggles.map((item, index) => (
                <SettingsToggleRow
                  key={item.id}
                  item={item}
                  checked={toggleState[item.id] ?? item.defaultChecked}
                  onCheckedChange={(checked) => handleToggle(item.id, checked)}
                  isLast={!section.showFontSize && index === section.toggles!.length - 1}
                />
              ))}

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
