'use client';

import { useState } from 'react';

import { AvatarHero } from '@/components/avatar/AvatarHero';
import { CHARACTER_TYPES, COLOR_THEMES, getThemeRoles } from '@/constants/avatar';
import { MOOD_EXPRESSION } from '@/constants/mood-expression';
import { cn } from '@/lib/cn';
import type { CharacterType, ColorTheme } from '@/types/avatar';
import type { Mood } from '@/types/mypage/model';

// Mood 유니온을 손으로 다시 나열하면 감정이 추가돼도 타입 검사에 안 걸린다 → 상수 테이블에서 파생.
const MOODS = Object.keys(MOOD_EXPRESSION) as Mood[];

// 감정·테마 검증 하네스. 실제 아바타 탭과 **같은 AvatarHero**를 쓴다 —
// 오버레이 층 순서·심볼 앵커·모델 경로를 여기서 따로 조립하면 POC가 실물과 조용히 어긋난다.
// 아바타 탭에는 없는 무색(tinted=false) 토글과 감정 셀렉터만 여기서 얹는다.
export function Live2dPoc() {
  const [theme, setTheme] = useState<ColorTheme>('클래식');
  // false = 무색(틴트 없이 원본 텍스처 그대로). 털 그레이스케일이 살아있는지 확인할 때 쓴다.
  const [tinted, setTinted] = useState(true);
  const [mood, setMood] = useState<Mood>('보통');
  const [characterType, setCharacterType] = useState<CharacterType>('레서판다');

  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="bg-coral-soft/40 flex size-[360px] items-center justify-center rounded-3xl">
        <AvatarHero
          characterType={characterType}
          colorTheme={theme}
          mood={mood}
          tinted={tinted}
          size={320}
          // SVG 폴백은 className이 크기를 정한다(정사각이라야 오버레이 %가 실제 탭과 일치). Live2D는 size로 렌더.
          className="size-80"
          title={`${characterType} 아바타`}
        />
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {CHARACTER_TYPES.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setCharacterType(value)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-sm transition',
              characterType === value ? 'border-coral bg-coral-soft/40' : 'border-cream',
            )}
          >
            {value}
          </button>
        ))}
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
