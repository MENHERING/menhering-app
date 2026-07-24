'use client';

import { useEffect, useId, useRef, useState } from 'react';

import { Application, settings, UPDATE_PRIORITY } from 'pixi.js';

import { TapSymbol } from '@/components/avatar/TapSymbol';
import { getThemeRoles } from '@/constants/avatar';
import {
  EXPRESSION_KEYS,
  getMoodExpression,
  type MoodExpression,
} from '@/constants/mood-expression';
import { cn } from '@/lib/cn';
import { loadCubism4, type Live2DModel } from '@/lib/live2d/load-cubism4';
import { prefersReducedMotion } from '@/lib/prefers-reduced-motion';
import type { ColorTheme } from '@/types/avatar';
import type { Mood } from '@/types/mypage/model';

// Live2D 캐릭터 렌더러. 커스텀 모델을 WebGL로 띄우고, 물리 없이 코드로 모션
// (자동 깜빡임·귀/꼬리/하트 흔들림·호흡·포인터 반응)을 구동한다. 리깅 파라미터는
// "모양"만 제공하고 실제 움직임 값은 여기서 흔들어 만든다.
//
// ⚠️ 사용법·제약(싱글톤=동시 1개만)·재마운트 버그 원인/해결은 docs/live2d/frontend-integration.md 참고.
//
// 색은 드로어블별 Multiply(per-part)로 칠한다 — 털(body_fur/tail/arm)만 테마색을 곱하고
// 크림 무늬·눈·하트(body_base/eye/heart)는 원본 텍스처 색을 유지한다. applyTint 참고.

// 번들러(Turbopack) 조합에서 settings 사이드이펙트가 누락되면 batch 렌더러가
// maxTextures=0으로 초기화되며 셰이더 검증에서 죽는다. 모듈 로드 시 1회 방어(전역 설정이라
// 렌더 컴포넌트 effect가 아니라 여기서 한 번만 보정).
if (!settings.SPRITE_MAX_TEXTURES) settings.SPRITE_MAX_TEXTURES = 16;

// 우리가 호출하는 코어 모델 API만 좁게 선언(플러그인 타입상 coreModel은 object로 노출됨).
interface CubismCoreModel {
  setParameterValueById(id: string, value: number, weight?: number): void;
  // 드로어블 id 목록(인덱스 순). Multiply/overwrite API의 index와 순서가 일치한다.
  getDrawableIds(): string[];
  // 드로어블별 Multiply 색(0~1). overwrite 플래그가 켜져 있어야 렌더에 반영된다.
  setMultiplyColorByRGBA(index: number, r: number, g: number, b: number, a?: number): void;
  // 이 드로어블의 Multiply를 코드 값으로 덮어쓸지. 꺼져 있으면 매 프레임 moc3 원본값을 쓴다.
  setOverwriteFlagForDrawableMultiplyColors(index: number, value: boolean): void;
}

// 테마 body색을 곱할 드로어블 목록은 캐릭터마다 다르다(예: 토끼 흰 솜꼬리는 틴트 제외, 고양이·강아지
// 귀는 몸과 같이 물들어야 함) → 상위(AvatarHero)가 캐릭터별 목록을 `tintDrawables` prop으로 넘긴다.
// 목록의 단일 출처는 live2d-tint-drawables.json(캐릭터→드로어블 맵)이며 scripts/desaturate-fur.mjs가
// **같은 맵**으로 텍스처를 회색화한다. 둘이 어긋나면 틴트는 되지만 회색화 안 된 부위가 탁하게 렌더된다.
// 나머지 드로어블(눈·하트·크림·코·입·볼)은 흰색(1,1,1)으로 덮어써 원본 텍스처 색을 유지한다.

// pixi Application/WebGL 컨텍스트를 페이지 세션 내내 하나만 두고 재사용한다.
// 컨텍스트를 파괴·재생성하면 플러그인(Cubism)의 셰이더·마스크가 첫 컨텍스트에 묶인 채 orphan돼,
// SPA 재마운트(탭 이동 후 복귀) 시 렌더가 에러 없이 빈 화면이 된다. 컨텍스트를 살려두면 방지된다.
// (Live2D 히어로/POC는 한 번에 하나만 마운트되므로 싱글톤이 안전하다.)
let sharedApp: Application | null = null;

// #RRGGBB → 0~1 RGB. 잘못된 값이면 흰색(무틴트).
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return { r: 1, g: 1, b: 1 };
  const n = parseInt(m[1], 16);
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
}

interface Live2DCharacterProps {
  modelUrl: string;
  /** 테마색을 곱할 드로어블 id 목록(캐릭터별). 나머지는 원본 텍스처 색 유지. */
  tintDrawables: string[];
  /** 발 높이 정렬 보정값(캔버스 높이 대비 비율, +는 아래로). 원화별 배치 차이를 상쇄해 서있는 위치를 통일. */
  feetNudge?: number;
  colorTheme: ColorTheme;
  /** '기본'(무색) 테마일 때 body에 곱할 색(캐릭터별). 생략 시 흰색(곱셈 무효=원화색 유지). */
  naturalBody?: string;
  /** 감정 상태 → 표정(입/눈/눈썹/볼). 생략 시 무표정(보통). */
  mood?: Mood;
  /** false면 틴트 없이 원본 텍스처 색 그대로(무색). 기본 true. */
  tinted?: boolean;
  /** 캔버스 한 변 픽셀(정사각). 기본 128. */
  size?: number;
  /** 포인터를 따라 살짝 기울일지. 히어로처럼 인터랙티브한 곳만 true. */
  interactive?: boolean;
  className?: string;
  /** 접근성 라벨(장식용이면 생략). */
  title?: string;
  /** 로드/렌더 실패 시 호출 → 상위(AvatarHero)가 SVG로 폴백. */
  onError?: () => void;
}

// 탭 그룹(burst)마다 중앙에서 살짝 어긋나게 하는 오프셋. burstId % 길이로 순환시켜 랜덤 없이
// (SSR/재현성 안전) 다양성을 준다. 컨테이너 div에만 적용 — 애니메이션되는 심볼 span에 transform을
// 주면 heart-float의 transform과 충돌한다. 값은 미세하게(±12px 안쪽) 둬 그룹이 흩어져 보이지 않게 한다.
const BURST_OFFSETS = [
  '',
  '-translate-x-3 -translate-y-1',
  'translate-x-3 translate-y-1',
  '-translate-x-2 translate-y-2',
  'translate-x-2 -translate-y-2',
];

export function Live2DCharacter({
  modelUrl,
  tintDrawables,
  feetNudge,
  colorTheme,
  naturalBody,
  mood,
  tinted = true,
  size = 128,
  interactive = false,
  className,
  title,
  onError,
}: Live2DCharacterProps) {
  // Pixi가 캔버스를 소유하도록 컨테이너만 렌더에 두고 <canvas>는 append한다. React가 캔버스를
  // 재사용하면 destroy로 소실된 WebGL 컨텍스트를 새 Application이 다시 못 잡는 문제가 있어서다.
  const containerRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<Live2DModel | null>(null);
  const pointerRef = useRef({ x: 0, active: false });
  // 탭 반응(귀 쫑긋 + 심볼 뿅). ticker가 reactionRef를 읽어 파라미터를 흔들고, bursts는 DOM 오버레이.
  const reactionRef = useRef({ active: false, t: 0 });
  // 탭 1회 = 심볼 3개짜리 그룹(burst) 하나. 연타하면 그룹이 중앙에 겹쳐 쌓인다(옆으로 안 번짐).
  const burstIdRef = useRef(0);
  // 하트 그라데이션 id의 인스턴스별 접두사. useId 결과에 콜론이 섞일 수 있어 지운다(url(#...) 참조 안전).
  const tapGradientId = useId().replace(/:/g, '');
  const [bursts, setBursts] = useState<number[]>([]);
  // 부모 리렌더로 콜백이 바뀌어도 init effect를 재실행하지 않도록 ref로 고정.
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  // 테마/틴트/틴트대상 변경은 모델 재생성 없이 재틴트만. init 이후 도착하는 첫 값도 여기서 반영.
  const colorThemeRef = useRef(colorTheme);
  const tintedRef = useRef(tinted);
  const tintDrawablesRef = useRef(tintDrawables);
  const naturalBodyRef = useRef(naturalBody);
  useEffect(() => {
    colorThemeRef.current = colorTheme;
    tintedRef.current = tinted;
    tintDrawablesRef.current = tintDrawables;
    naturalBodyRef.current = naturalBody;
    if (modelRef.current)
      applyTint(modelRef.current, colorTheme, tinted, tintDrawables, naturalBody);
  }, [colorTheme, tinted, tintDrawables, naturalBody]);

  // mood 변경도 모델 재생성 없이 반영한다. 티커가 도는 평소엔 매 프레임 moodRef를 읽어 보간하므로
  // ref 갱신만으로 충분하다. reduce-motion일 땐 티커 자체가 없어 아무도 ref를 안 읽으므로,
  // colorTheme의 재틴트 effect와 같은 식으로 여기서 정적 표정을 직접 다시 얹어야 한다.
  const moodRef = useRef(mood);
  useEffect(() => {
    moodRef.current = mood;
    const model = modelRef.current;
    if (model && prefersReducedMotion()) applyStaticExpression(model, mood);
  }, [mood]);

  // 발 정렬 보정값은 init에서 모델 배치 시 1회만 읽는다(캐릭터 변경 시 modelUrl이 바뀌어 재init됨).
  const feetNudgeRef = useRef(feetNudge);
  useEffect(() => {
    feetNudgeRef.current = feetNudge;
  }, [feetNudge]);

  useEffect(() => {
    let disposed = false;
    let app: Application | null = null;
    let tickerFn: (() => void) | null = null;
    const reduceMotion = prefersReducedMotion();

    // 모션 상태
    let t = 0;
    let blinking = false;
    let blinkT = 0;
    let nextBlink = 2 + Math.random() * 2;

    async function init() {
      try {
        // Core 스크립트 로드 → 플러그인 import → resolveURL 패치를 loadCubism4가 1회만 수행한다.
        const { Live2DModel } = await loadCubism4();
        if (disposed || !containerRef.current) return;

        // 싱글톤 앱/컨텍스트 재사용(위 sharedApp 주석 참고). 처음만 생성하고, 이후엔 크기만 맞춰
        // 재사용하며 캔버스를 현재 컨테이너에 붙인다.
        if (!sharedApp) {
          sharedApp = new Application({
            width: size,
            height: size,
            backgroundAlpha: 0,
            antialias: true,
            autoDensity: true,
            resolution: window.devicePixelRatio || 1,
          });
        }
        app = sharedApp;
        app.renderer.resize(size, size);
        app.start();
        containerRef.current.appendChild(app.view as HTMLCanvasElement);

        // 모든 자동화를 끈다. 업데이트·렌더는 전역 Ticker.shared가 아니라 이 컴포넌트의 app.ticker로
        // 직접 구동한다(아래) — SPA 재마운트 시 전역 ticker 상태에 안 묶여 견고하다. 포인터도 코드로 처리.
        // (v0.5.0에서 autoInteract → autoHitTest/autoFocus로 분리됨)
        const model = await Live2DModel.from(modelUrl, {
          autoUpdate: false,
          autoHitTest: false,
          autoFocus: false,
        });
        if (disposed || !app) {
          model.destroy();
          return;
        }

        // 모델 전신을 캔버스 양축에 맞춰 담고(여백 0.92) 가운데 정렬.
        // ⚠️ app.screen(논리 픽셀)로 계산한다 — app.renderer는 device 픽셀(=논리×dpr)이라
        // dpr>1이면 모델이 dpr배 커져 캔버스를 넘쳐 잘린다.
        const canvasW = app.screen.width;
        const canvasH = app.screen.height;
        const baseScale = Math.min(canvasW / model.width, canvasH / model.height) * 0.92;
        model.scale.set(baseScale);
        model.anchor.set(0.5, 0.5);
        model.position.set(canvasW / 2, canvasH / 2);
        app.stage.addChild(model);
        modelRef.current = model;

        // 모델 캔버스 여백으로 판다가 쏠려 잘리는 걸 실제 렌더 바운드(getBounds) 중심으로 보정.
        const gb = model.getBounds();
        if (isFinite(gb.width) && gb.width > 1 && isFinite(gb.height) && gb.height > 1) {
          model.position.set(
            model.x + (canvasW / 2 - (gb.x + gb.width / 2)),
            model.y + (canvasH / 2 - (gb.y + gb.height / 2)),
          );
        }

        // 캐릭터마다 원화가 모델 캔버스 내 다른 높이에 그려져(AI 생성) 캔버스 중심 정렬만으론 "서있는
        // 발 높이"가 종마다 어긋난다. 측정한 보정값(feetNudge: 캔버스높이 대비 비율, +는 아래로)으로 세로
        // 정렬한다. 실측(readPixels)은 캔버스 표시 상태에 따라 조용히 실패할 수 있어 정적 측정값을 쓴다.
        if (feetNudgeRef.current) model.y += feetNudgeRef.current * canvasH;

        applyTint(
          model,
          colorThemeRef.current,
          tintedRef.current,
          tintDrawablesRef.current,
          naturalBodyRef.current,
        );

        if (reduceMotion) {
          // 정적 렌더: 움직임 없이 현재 감정 표정만 1회 얹고 배치. 이후 mood 변경은 위 effect가 얹는다.
          applyStaticExpression(model, moodRef.current);
          return;
        }

        const core = model.internalModel.coreModel as unknown as CubismCoreModel;
        const setP = (id: string, v: number) => core.setParameterValueById(id, v);
        const ticker = app.ticker;

        // 표정 보간 상태. 목표(mood)로 매 프레임 부드럽게 다가간다.
        const cur: MoodExpression = { ...getMoodExpression(moodRef.current) };

        // 전역 Ticker.shared 대신 app.ticker로 구동(HIGH: app 렌더 전에 update가 반영되도록).
        tickerFn = () => {
          if (disposed) return;
          const dt = ticker.deltaMS / 1000;
          t += dt;

          // 감정 표정을 목표값으로 보간(입/눈웃음/눈썹/볼). 눈뜸 베이스는 아래 깜빡임과 곱한다.
          // 감쇠율은 dt에 지수적으로 물려 프레임레이트와 무관하게 같은 시정수(~0.17s)를 갖는다.
          // 선형 dt*6이면 탭 백그라운드 복귀처럼 dt가 튀는 프레임에서 목표로 확 점프해 팝인 된다.
          const target = getMoodExpression(moodRef.current);
          const k = 1 - Math.exp(-dt * 6);
          for (const key of EXPRESSION_KEYS) {
            cur[key] += (target[key] - cur[key]) * k;
          }

          // 자동 눈 깜빡임(0~1). applyExpression에서 감정 베이스 눈뜸과 곱해진다 —
          // 반개 키폼이 붙어 eyeOpen<1을 쓰게 되면 졸린 상태의 깜빡임도 자연스럽게 겹친다.
          let blinkFactor = 1;
          if (blinking) {
            blinkT += dt;
            const dur = 0.14;
            blinkFactor =
              blinkT < dur / 2 ? 1 - blinkT / (dur / 2) : (blinkT - dur / 2) / (dur / 2);
            blinkFactor = Math.max(0, Math.min(1, blinkFactor));
            if (blinkT >= dur) {
              blinking = false;
              blinkFactor = 1;
              nextBlink = 2 + Math.random() * 3;
            }
          } else {
            nextBlink -= dt;
            if (nextBlink <= 0) {
              blinking = true;
              blinkT = 0;
            }
          }
          applyExpression(setP, cur, blinkFactor);

          // 포인터 반응(비활성/미사용이면 0으로 감쇠)
          const px = interactive && pointerRef.current.active ? pointerRef.current.x : 0;
          model.rotation = px * 0.05;

          // 탭 반응 버스트: 귀가 쫑긋 솟았다 잦아들고 하트 펜던트가 통 튄다(~0.55s 반원 곡선).
          let earPerk = 0;
          let heartPop = 0;
          if (reactionRef.current.active) {
            reactionRef.current.t += dt;
            const p = reactionRef.current.t / 0.55;
            if (p >= 1) {
              reactionRef.current.active = false;
            } else {
              const swell = Math.sin(p * Math.PI);
              earPerk = swell * 16;
              heartPop = swell * 12;
            }
          }

          // 귀·꼬리·하트 idle 흔들림(서로 다른 주기/위상 + 포인터 편향 + 탭 반응)
          setP('ParamEarSway', 5 * Math.sin(t * 1.6) + px * 3 + earPerk);
          setP('ParamTailSway', 1.5 * Math.sin(t * 1.15 + 0.7) + px * 0.5);
          setP('ParamHeartSway', 6 * Math.sin(t * 2.1 + 1.3) + heartPop);

          // 호흡(세로 스케일 미세 진동)
          model.scale.set(baseScale, baseScale * (1 + 0.012 * Math.sin(t * 1.3)));

          // 얹은 파라미터를 모델에 직접 반영(autoUpdate 대신) → 이 프레임 렌더에 바로 나온다.
          model.update(ticker.deltaMS);
        };
        ticker.add(tickerFn, undefined, UPDATE_PRIORITY.HIGH);
      } catch (err) {
        console.error('[Live2DCharacter]', err);
        if (!disposed) onErrorRef.current?.();
      }
    }

    init();

    return () => {
      disposed = true;
      // 공유 앱은 파괴하지 않는다(GL 컨텍스트 유지). 이 마운트가 얹은 것만 정리한다.
      if (tickerFn && app) app.ticker.remove(tickerFn);
      const m = modelRef.current;
      modelRef.current = null;
      if (m) {
        app?.stage.removeChild(m);
        // 포크의 Cubism teardown이 pixi7에서 간헐적으로 undefined를 만져 던지므로 방어한다.
        try {
          m.destroy();
        } catch {
          // 정리 실패 무시 — 컨텍스트는 재사용되고 모델 참조는 곧 GC된다.
        }
      }
      // 렌더 루프를 멈추고 캔버스를 컨테이너에서 뗀다(app·컨텍스트는 다음 마운트에서 재사용).
      app?.stop();
      const view = app?.view as HTMLCanvasElement | undefined;
      view?.parentNode?.removeChild(view);
    };
    // colorTheme은 재틴트 전용 effect에서 처리 → 여기 넣으면 테마 변경 시 모델이 통째로 재생성됨.
  }, [modelUrl, size, interactive]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1; // -1 ~ 1
    pointerRef.current = { x: Math.max(-1, Math.min(1, x)), active: true };
  };
  const handlePointerLeave = () => {
    pointerRef.current.active = false;
  };
  // 탭하면 귀 쫑긋 + 심볼 뿅. reduce-motion이면 반응 생략(효과음은 상위에서 유지).
  const handleTap = () => {
    if (prefersReducedMotion()) return;
    reactionRef.current = { active: true, t: 0 };
    const burstId = burstIdRef.current;
    burstIdRef.current += 1;
    setBursts((prev) => [...prev, burstId]);
  };
  const removeBurst = (id: number) => setBursts((prev) => prev.filter((b) => b !== id));

  return (
    // Pixi가 소유하는 캔버스 컨테이너 + 하트 오버레이를 형제로 감싼다. 오버레이를 컨테이너 자식으로
    // 두면 Pixi가 append한 캔버스를 React가 건드려 충돌하므로 분리한다.
    <div className={cn('relative', className)}>
      {/* 크기 클래스를 두지 않는다 — 컨테이너는 Pixi가 append한 캔버스(size 픽셀) 콘텐츠 크기로
          잡힌다. size-full로 부모(래퍼) %를 참조하면 className 미전달(POC)일 때 접힐 수 있다. */}
      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handleTap}
        // 이름이 있을 때만 img 역할 부여(빈 aria-label로 이름 없는 이미지가 되는 것 방지).
        {...(title ? { role: 'img', 'aria-label': title } : {})}
      />
      {/* 탭마다 독립된 심볼 그룹(burst)을 그린다. 각 그룹은 절대배치로 같은 중앙 자리에 겹쳐 쌓이므로,
          연타해도 심볼이 옆으로 번지지 않는다(한 그룹에 심볼을 계속 추가하면 flex가 폭을 넓혀 번진다).
          그룹 내부는 flex + gap으로 세 심볼을 균등 간격·중앙 정렬한다 — left%/transform 대신 flex라야
          heart-float 애니메이션의 transform(translateY+scale)과 충돌하지 않는다.
          클리핑 없음 → 심볼이 머리 위 캔버스 밖(숲 하늘)까지 떠오른다. 카드 overflow가 최종 클립.
          top-[12%]는 심볼이 솟기 시작하는 높이. justify-center 그룹을 살짝 왼쪽으로(pr) 캐릭터 시각
          중심에 맞춘다 — 캔버스에서 캐릭터가 컨테이너 정중앙보다 약간 왼쪽에 있다. */}
      {bursts.map((burstId) => (
        // 그룹 내 세 심볼은 애니메이션이 동시에 끝난다 → 자식 animationend가 컨테이너로 버블되면
        // 그룹 전체를 한 번에 제거한다(이후 중복 이벤트는 filter가 무시).
        <div
          key={burstId}
          onAnimationEnd={() => removeBurst(burstId)}
          className={cn(
            'pointer-events-none absolute inset-x-0 top-[12%] flex items-start justify-center gap-3 pr-[8%]',
            BURST_OFFSETS[burstId % BURST_OFFSETS.length],
          )}
          aria-hidden
        >
          {[0, 1, 2].map((slot) => (
            <span
              key={slot}
              className={cn('animate-heart-float', slot === 1 ? 'size-8' : 'size-6')}
            >
              {/* 그라데이션 id는 문서 전역이라 그룹·슬롯마다 고유해야 한다(심볼이 여럿 동시에 뜬다). */}
              <TapSymbol mood={mood} gradientId={`${tapGradientId}-${burstId}-${slot}`} />
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

// 감정 표정 파라미터를 모델에 얹는다. 최종 눈뜸 = 감정 베이스(expr.eyeOpen) × 깜빡임(blinkFactor)
// 이라 눈뜸의 출처를 여기 하나로 둔다 — 호출부는 깜빡임 진행도만 넘긴다.
// 눈썹은 좌우 대칭으로 같은 값을 넣는다(비대칭 표정은 아직 미사용). 모델 키폼 범위를 벗어나는
// 값은 Cubism이 파라미터별 min/max로 자동 클램프하므로 오버슈트는 안전하다.
function applyExpression(
  setP: (id: string, v: number) => void,
  expr: MoodExpression,
  blinkFactor = 1,
) {
  const eyeOpen = expr.eyeOpen * blinkFactor;
  setP('ParamEyeLOpen', eyeOpen);
  setP('ParamEyeROpen', eyeOpen);
  setP('ParamEyeLSmile', expr.eyeSmile);
  setP('ParamEyeRSmile', expr.eyeSmile);
  setP('ParamMouthForm', expr.mouthForm);
  setP('ParamMouthOpenY', expr.mouthOpen);
  setP('ParamBrowLY', expr.browY);
  setP('ParamBrowRY', expr.browY);
  setP('ParamBrowLForm', expr.browForm);
  setP('ParamBrowRForm', expr.browForm);
  setP('ParamCheek', expr.cheek);
}

// reduce-motion 정적 렌더용. 티커가 없으므로 보간·깜빡임 없이 목표 표정을 즉시 얹고 1회 배치한다.
function applyStaticExpression(model: Live2DModel, mood: Mood | undefined) {
  const core = model.internalModel.coreModel as unknown as CubismCoreModel;
  applyExpression((id, v) => core.setParameterValueById(id, v), getMoodExpression(mood));
  model.update(16);
}

// 부위별 틴트. 모든 드로어블의 Multiply를 명시적으로 덮어쓴다 — 틴트 대상(tintDrawables, 캐릭터별
// 털·귀·꼬리 등)은 테마색, 나머지(크림·눈·코·하트)는 흰색(1,1,1). overwrite 플래그를 켜 매 프레임 유지.
//
// ⚠️ 나머지를 흰색으로 "명시" 덮어써야 하는 이유: 이 플러그인은 0.4.0과 달리 드로어블별 baked
// Multiply를 실제로 렌더한다. 재리깅 모델의 일부 드로어블(눈 등)에 흰색 아닌 baked 값이 남아
// 있으면 그대로 어둡게/안 보이게 뜬다. 흰색으로 덮어써 원본 텍스처 색을 복원한다.
function applyTint(
  model: Live2DModel,
  colorTheme: ColorTheme,
  tinted: boolean,
  tintDrawables: string[],
  naturalBody?: string,
) {
  const core = model.internalModel.coreModel as unknown as CubismCoreModel;
  const tintSet = new Set(tintDrawables);
  // '기본'(무색, 원화색)은 캐릭터별 색을 곱한다 — 대부분 흰색(곱셈 무효=원화색 유지), 텍스처가
  // 회색화된 캐릭터(레서판다)는 원래 색을 넣는다. 그 외 테마는 테마 body색.
  const body = colorTheme === '기본' ? (naturalBody ?? '#FFFFFF') : getThemeRoles(colorTheme).body;
  const tint = tinted ? hexToRgb(body) : { r: 1, g: 1, b: 1 };
  const ids = core.getDrawableIds();
  for (let i = 0; i < ids.length; i++) {
    const { r, g, b } = tintSet.has(ids[i]) ? tint : { r: 1, g: 1, b: 1 };
    core.setMultiplyColorByRGBA(i, r, g, b, 1);
    core.setOverwriteFlagForDrawableMultiplyColors(i, true);
  }
}
