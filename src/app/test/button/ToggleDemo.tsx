'use client';

import { useState } from 'react';

import { Toggle } from '@/components/common/Toggle';

// Toggle은 상태가 필요해 client로 분리 (page는 server 유지)
export function ToggleDemo() {
  const [sfx, setSfx] = useState(true);
  const [dark, setDark] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Toggle checked={sfx} onCheckedChange={setSfx} aria-label="효과음" />
        <span className="text-sm text-gray-600">효과음 {sfx ? 'ON' : 'OFF'}</span>
      </div>
      <div className="flex items-center gap-3">
        <Toggle checked={dark} onCheckedChange={setDark} aria-label="다크 모드" />
        <span className="text-sm text-gray-600">다크 모드 {dark ? 'ON' : 'OFF'}</span>
      </div>
      <div className="flex items-center gap-3">
        <Toggle checked disabled onCheckedChange={() => {}} aria-label="비활성" />
        <span className="text-sm text-gray-400">disabled</span>
      </div>
    </div>
  );
}
