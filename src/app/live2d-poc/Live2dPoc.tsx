'use client';

import { useState } from 'react';

import dynamic from 'next/dynamic';

import { MoodBackdrop } from '@/components/avatar/MoodBackdrop';
import { MoodSymbol } from '@/components/avatar/MoodSymbol';
import { COLOR_THEMES, getThemeRoles } from '@/constants/avatar';
import { CHARACTER_REGISTRY } from '@/constants/character-registry';
import { MOOD_EXPRESSION } from '@/constants/mood-expression';
import { cn } from '@/lib/cn';
import type { ColorTheme } from '@/types/avatar';
import type { Mood } from '@/types/mypage/model';

// 실제 아바타 탭과 동일한 로딩 경로(dynamic ssr:false)로 npm 런타임을 검증한다.
const Live2DCharacter = dynamic(
  () => import('@/components/avatar/Live2DCharacter').then((m) => m.Live2DCharacter),
  { ssr: false },
);

// 모델 경로·심볼 앵커는 아바타 탭과 같은 출처(레지스트리)를 써야 POC가 실물과 어긋나지 않는다.
const REDPANDA = CHARACTER_REGISTRY['레서판다'].live2d!;

// Mood 유니온을 손으로 다시 나열하면 감정이 추가돼도 타입 검사에 안 걸린다 → 상수 테이블에서 파생.
const MOODS = Object.keys(MOOD_EXPRESSION) as Mood[];

// A단계 검증 하네스: npm 번들(pixi + pixi-live2d-display) + 자체 호스팅 Cubism Core로
// 우리 모델이 렌더·모션·틴트되는지 확인한다. 색은 아직 전체 틴트(B에서 부위별로 교체).
export function Live2dPoc() {
  const [theme, setTheme] = useState<ColorTheme>('클래식');
  // false = 무색(틴트 없이 원본 텍스처 그대로).
  const [tinted, setTinted] = useState(true);
  const [mood, setMood] = useState<Mood>('보통');

  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="bg-coral-soft/40 flex size-[360px] items-center justify-center rounded-3xl">
        {/* 심볼 오버레이가 캔버스 좌표를 기준으로 얹히도록 정사각 래퍼로 감싼다.
            MoodBackdrop은 캐릭터보다 먼저(=뒤에), MoodSymbol은 나중에(=앞에) 그려진다. */}
        <div className="relative">
          <MoodBackdrop mood={mood} />
          <Live2DCharacter
            modelUrl={REDPANDA.modelUrl}
            colorTheme={theme}
            mood={mood}
            tinted={tinted}
            size={320}
            interactive
            title="레서판다 Live2D"
          />
          <MoodSymbol mood={mood} anchors={REDPANDA.moodAnchors} />
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {MOODS.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setMood(value)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-sm transition',
              mood === value ? 'border-coral bg-coral-soft/40' : 'border-cream',
            )}
          >
            {value}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => setTinted(false)}
          className={cn(
            'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition',
            !tinted ? 'border-coral bg-coral-soft/40' : 'border-cream',
          )}
        >
          {/* 무색 = 틴트 없이 원본 텍스처. 스와치는 흰 바탕에 대각 슬래시로 "색 없음" 표시 */}
          <span className="relative size-4 overflow-hidden rounded-full border border-black/10 bg-white">
            <span className="absolute top-1/2 left-1/2 h-px w-6 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-red-400" />
          </span>
          무색
        </button>
        {COLOR_THEMES.map(({ value }) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setTheme(value);
              setTinted(true);
            }}
            className={cn(
              'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition',
              tinted && theme === value ? 'border-coral bg-coral-soft/40' : 'border-cream',
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
