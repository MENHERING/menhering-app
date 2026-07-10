import { cn } from '@/lib/cn';
import type { Mood } from '@/types/mypage/model';

// 캐릭터 "뒤"에 깔리는 감정 배경. Live2D 캔버스는 backgroundAlpha:0(투명)이라 뒤에 둔 요소가
// 그대로 비쳐 보인다 → 모델 재리깅 없이 분위기를 바꿀 수 있다. (홍조처럼 얼굴에 붙어 같이
// 변형돼야 하는 것만 드로어블=리깅이 필요하다.)
//
// ⚠️ 캐릭터보다 DOM 순서상 **먼저** 와야 한다. z-index 음수로 뒤로 보내면 래퍼가 스태킹
// 컨텍스트를 안 만들어서 조상(카드)의 배경보다 아래로 내려가 아예 안 보인다.

// 감정별 기운 색·농도. 얼굴 표정만으로는 우울/지침이 거의 같아 보이므로 색으로 갈라 준다.
// 보통만 비워 둔다 — 기준선이 깨끗해야 나머지 감정이 대비로 읽힌다.
//
// 농도는 실제 아바타 탭(숲 배경) 기준으로 잡았다. POC의 평평한 코랄 카드보다 배경이 복잡해
// 같은 값이라도 훨씬 옅게 읽힌다. 무채색(지침)은 같은 알파에서 제일 무거워 한 단계 낮춘다.
const MOOD_AURA: Partial<Record<Mood, string>> = {
  행복: 'bg-aura-pink/55',
  우울: 'bg-aura-blue/70',
  지침: 'bg-aura-ink/55',
  화남: 'bg-aura-red/60',
};

// 지침의 만화적 세로 해칭. 머리 위·양옆 배경에 길이가 제각각인 선이 내리꽂힌다.
// 얼굴 위가 아니라 배경에 그어야(=캐릭터 뒤) 레퍼런스의 "축 처짐"이 나온다.
// 캐릭터에 가려지는 가운데 선들은 자연스럽게 잘려 바깥쪽만 남는다.
const HATCHING = [
  { x: 9, y: 5, len: 24, opacity: 0.5 },
  { x: 17, y: 2, len: 33, opacity: 0.75 },
  { x: 25, y: 9, len: 18, opacity: 0.45 },
  { x: 33, y: 3, len: 29, opacity: 0.65 },
  { x: 42, y: 7, len: 21, opacity: 0.5 },
  { x: 50, y: 2, len: 31, opacity: 0.7 },
  { x: 58, y: 8, len: 19, opacity: 0.45 },
  { x: 67, y: 3, len: 30, opacity: 0.7 },
  { x: 75, y: 9, len: 20, opacity: 0.5 },
  { x: 83, y: 2, len: 32, opacity: 0.75 },
  { x: 91, y: 6, len: 23, opacity: 0.5 },
];

interface MoodBackdropProps {
  mood?: Mood;
}

export function MoodBackdrop({ mood }: MoodBackdropProps) {
  const auraClassName = mood ? MOOD_AURA[mood] : undefined;
  if (!auraClassName) return null;

  return (
    <div className="pointer-events-none absolute inset-0 flex justify-center" aria-hidden>
      {/* 캐릭터를 감싸는 흐릿한 기운. 가로로 넓은 타원이어야 한다:
          ① 정원(正圓)으로 두면 진한 중심부를 캐릭터가 통째로 가려서, 흐리게 번진 양끝만 보인다.
          ② 세로로 키우면 아래 이름표 카드 영역까지 물든다.
          blur를 3xl(64px)까지 주면 색이 흩어져 숲 위에서 안 읽힌다 → 28px로 조이고 알파를 올린다. */}
      {/* shrink-0: 부모가 flex라 이게 없으면 w-[120%]가 100%로 줄어든다(캐릭터에 다 가려짐). */}
      <div
        className={cn('mt-[1%] h-[92%] w-[120%] shrink-0 rounded-full blur-[28px]', auraClassName)}
      />

      {mood === '지침' && (
        <svg
          viewBox="0 0 100 100"
          className="animate-weary-lines absolute inset-0 size-full opacity-80"
          preserveAspectRatio="none"
          aria-hidden
          focusable="false"
        >
          <g className="stroke-plum" strokeWidth={1.1} strokeLinecap="round">
            {HATCHING.map((line) => (
              <line
                key={line.x}
                x1={line.x}
                y1={line.y}
                x2={line.x}
                y2={line.y + line.len}
                strokeOpacity={line.opacity}
              />
            ))}
          </g>
        </svg>
      )}
    </div>
  );
}
