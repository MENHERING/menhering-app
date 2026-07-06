'use client';

import { useState } from 'react';

import dynamic from 'next/dynamic';

import { COLOR_THEMES, getThemeRoles } from '@/constants/avatar';
import { cn } from '@/lib/cn';
import type { ColorTheme } from '@/types/avatar';

// 실제 아바타 탭과 동일한 로딩 경로(dynamic ssr:false)로 npm 런타임을 검증한다.
const Live2DCharacter = dynamic(
  () => import('@/components/avatar/Live2DCharacter').then((m) => m.Live2DCharacter),
  { ssr: false },
);

const MODEL_URL = '/live2d/redpanda/menhering.model3.json';

// A단계 검증 하네스: npm 번들(pixi + pixi-live2d-display) + 자체 호스팅 Cubism Core로
// 우리 모델이 렌더·모션·틴트되는지 확인한다. 색은 아직 전체 틴트(B에서 부위별로 교체).
export function Live2dPoc() {
  const [theme, setTheme] = useState<ColorTheme>('클래식');

  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="bg-coral-soft/40 flex size-[360px] items-center justify-center rounded-3xl">
        <Live2DCharacter
          modelUrl={MODEL_URL}
          colorTheme={theme}
          size={320}
          interactive
          title="레서판다 Live2D"
        />
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {COLOR_THEMES.map(({ value }) => (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            className={cn(
              'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition',
              theme === value ? 'border-coral bg-coral-soft/40' : 'border-cream',
            )}
          >
            <span
              className="size-4 rounded-full border border-black/10"
              // 실제 모델이 틴트되는 body 역할색을 그대로 미리보기(임의 hex라 Tailwind 불가 → 인라인)
              style={{ backgroundColor: getThemeRoles(value).body }}
            />
            {value}
          </button>
        ))}
      </div>

      <p className="text-brown-soft max-w-md text-center text-sm">
        우리가 만든 Live2D 레서판다 — 자동 깜빡임·귀/꼬리/하트 흔들림·호흡. 캔버스 위에서 마우스를
        움직여보세요. 색은 아직 임시(전체 틴트)이고, 부위별 정확한 색은 다음 단계에서 붙습니다.
      </p>
    </div>
  );
}
