'use client';

import { useEffect, useRef } from 'react';

import type { Live2DModel } from 'pixi-live2d-display-lipsyncpatch/cubism4';
import { Application, settings, Ticker, UPDATE_PRIORITY } from 'pixi.js';

import { getThemeRoles } from '@/constants/avatar';
import type { ColorTheme } from '@/types/avatar';

// Live2D 캐릭터 렌더러. 커스텀 모델을 WebGL로 띄우고, 물리 없이 코드로 모션
// (자동 깜빡임·귀/꼬리/하트 흔들림·호흡·포인터 반응)을 구동한다. 리깅 파라미터는
// "모양"만 제공하고 실제 움직임 값은 여기서 흔들어 만든다.
//
// 색은 드로어블별 Multiply(per-part)로 칠한다 — 털(body_fur/tail/arm)만 테마색을 곱하고
// 크림 무늬·눈·하트(body_base/eye/heart)는 원본 텍스처 색을 유지한다. applyTint 참고.

// 자체 호스팅한 Cubism Core 런타임(프로퍼티어리라 npm 미배포). registerTicker 전에 로드돼야 한다.
const CUBISM_CORE_SRC = '/live2d/core/live2dcubismcore.min.js';

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

// 테마색을 곱할 "털" 드로어블(재리깅으로 크림과 분리됨). 나머지는 흰색(1,1,1)으로 덮어써
// 원본 텍스처 색을 그대로 유지한다.
const FUR_DRAWABLES = new Set(['body_fur', 'tail', 'arm_L', 'arm_R']);

// 플러그인 자동 업데이트가 PIXI.Ticker를 쓰도록 1회만 등록.
let tickerRegistered = false;

function loadCubismCore(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && 'Live2DCubismCore' in window) {
      resolve();
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${CUBISM_CORE_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Cubism Core 로드 실패')));
      return;
    }
    const el = document.createElement('script');
    el.src = CUBISM_CORE_SRC;
    el.async = false;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error('Cubism Core 로드 실패'));
    document.head.appendChild(el);
  });
}

// #RRGGBB → 0~1 RGB. 잘못된 값이면 흰색(무틴트).
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return { r: 1, g: 1, b: 1 };
  const n = parseInt(m[1], 16);
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
}

interface Live2DCharacterProps {
  modelUrl: string;
  colorTheme: ColorTheme;
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

export function Live2DCharacter({
  modelUrl,
  colorTheme,
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
  // 부모 리렌더로 콜백이 바뀌어도 init effect를 재실행하지 않도록 ref로 고정.
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  // 테마/틴트 변경은 모델 재생성 없이 재틴트만. init 이후 도착하는 첫 값도 여기서 반영.
  const colorThemeRef = useRef(colorTheme);
  const tintedRef = useRef(tinted);
  useEffect(() => {
    colorThemeRef.current = colorTheme;
    tintedRef.current = tinted;
    if (modelRef.current) applyTint(modelRef.current, colorTheme, tinted);
  }, [colorTheme, tinted]);

  useEffect(() => {
    let disposed = false;
    let app: Application | null = null;
    let tickerFn: (() => void) | null = null;
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 모션 상태
    let t = 0;
    let blinking = false;
    let blinkT = 0;
    let nextBlink = 2 + Math.random() * 2;

    async function init() {
      try {
        // 플러그인 cubism4 모듈은 import 시점에 Cubism Core를 요구한다 →
        // Core를 먼저 로드한 뒤 동적 import 해야 한다.
        await loadCubismCore();
        if (disposed || !containerRef.current) return;
        const { Live2DModel } = await import('pixi-live2d-display-lipsyncpatch/cubism4');
        if (!tickerRegistered) {
          Live2DModel.registerTicker(Ticker);
          tickerRegistered = true;
        }
        if (disposed || !containerRef.current) return;

        // view를 넘기지 않아 Pixi가 자체 캔버스를 만든다 → 매 마운트 새 캔버스+컨텍스트.
        app = new Application({
          width: size,
          height: size,
          backgroundAlpha: 0,
          antialias: true,
          autoDensity: true,
          resolution: window.devicePixelRatio || 1,
        });
        containerRef.current.appendChild(app.view as HTMLCanvasElement);

        // 포인터 반응은 코드로 직접 처리하므로 플러그인 내장 히트테스트·포커스는 끈다.
        // (v0.5.0에서 autoInteract → autoHitTest/autoFocus로 분리됨)
        const model = await Live2DModel.from(modelUrl, { autoHitTest: false, autoFocus: false });
        if (disposed || !app) {
          model.destroy();
          return;
        }

        // 모델 전신을 캔버스 양축에 맞춰 담고(여백 0.8) 가운데 정렬.
        const baseScale =
          Math.min(app.renderer.width / model.width, app.renderer.height / model.height) * 0.8;
        model.scale.set(baseScale);
        model.anchor.set(0.5, 0.5);
        model.position.set(app.renderer.width / 2, app.renderer.height / 2);
        app.stage.addChild(model);
        modelRef.current = model;

        // 모델 캔버스에 상단 여백이 있어 판다가 아래로 쏠려 다리가 잘리는 걸 보정한다.
        // 실제 렌더 바운드(getBounds)의 중심을 캔버스 중앙에 맞춘다. 바운드가 유효할 때만.
        const gb = model.getBounds();
        if (isFinite(gb.width) && gb.width > 1 && isFinite(gb.height) && gb.height > 1) {
          model.position.set(
            model.x + (app.renderer.width / 2 - (gb.x + gb.width / 2)),
            model.y + (app.renderer.height / 2 - (gb.y + gb.height / 2)),
          );
        }

        applyTint(model, colorThemeRef.current, tintedRef.current);

        if (reduceMotion) return; // 정적 렌더(움직임 없음)

        const core = model.internalModel.coreModel as unknown as CubismCoreModel;
        const setP = (id: string, v: number) => core.setParameterValueById(id, v);

        // 모델 자동 업데이트(NORMAL) 이후에 파라미터를 얹도록 LOW 우선순위로 구동.
        tickerFn = () => {
          if (disposed) return;
          const dt = Ticker.shared.deltaMS / 1000;
          t += dt;

          // 자동 눈 깜빡임
          let eyeOpen = 1;
          if (blinking) {
            blinkT += dt;
            const dur = 0.14;
            eyeOpen = blinkT < dur / 2 ? 1 - blinkT / (dur / 2) : (blinkT - dur / 2) / (dur / 2);
            eyeOpen = Math.max(0, Math.min(1, eyeOpen));
            if (blinkT >= dur) {
              blinking = false;
              eyeOpen = 1;
              nextBlink = 2 + Math.random() * 3;
            }
          } else {
            nextBlink -= dt;
            if (nextBlink <= 0) {
              blinking = true;
              blinkT = 0;
            }
          }
          setP('ParamEyeLOpen', eyeOpen);
          setP('ParamEyeROpen', eyeOpen);

          // 포인터 반응(비활성/미사용이면 0으로 감쇠)
          const px = interactive && pointerRef.current.active ? pointerRef.current.x : 0;
          model.rotation = px * 0.05;

          // 귀·꼬리·하트 idle 흔들림(서로 다른 주기/위상 + 포인터 편향)
          setP('ParamEarSway', 5 * Math.sin(t * 1.6) + px * 3);
          setP('ParamTailSway', 1.5 * Math.sin(t * 1.15 + 0.7) + px * 0.5);
          setP('ParamHeartSway', 6 * Math.sin(t * 2.1 + 1.3));

          // 호흡(세로 스케일 미세 진동)
          model.scale.set(baseScale, baseScale * (1 + 0.012 * Math.sin(t * 1.3)));
        };
        Ticker.shared.add(tickerFn, undefined, UPDATE_PRIORITY.LOW);
      } catch (err) {
        console.error('[Live2DCharacter]', err);
        if (!disposed) onErrorRef.current?.();
      }
    }

    init();

    return () => {
      disposed = true;
      if (tickerFn) Ticker.shared.remove(tickerFn);
      modelRef.current = null;
      // removeView=true: Pixi가 소유한 캔버스까지 파괴 → 컨텍스트 정리, 재마운트 시 새 캔버스.
      if (app) app.destroy(true, { children: true });
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

  return (
    <div
      ref={containerRef}
      className={className}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      // 이름이 있을 때만 img 역할 부여(빈 aria-label로 이름 없는 이미지가 되는 것 방지).
      {...(title ? { role: 'img', 'aria-label': title } : {})}
    />
  );
}

// 부위별 틴트. 모든 드로어블의 Multiply를 명시적으로 덮어쓴다 — 털(FUR_DRAWABLES)은 테마색,
// 나머지는 흰색(1,1,1). overwrite 플래그를 켜 매 프레임 유지시킨다.
//
// ⚠️ 나머지를 흰색으로 "명시" 덮어써야 하는 이유: 이 플러그인은 0.4.0과 달리 드로어블별 baked
// Multiply를 실제로 렌더한다. 재리깅 모델의 일부 드로어블(눈 등)에 흰색 아닌 baked 값이 남아
// 있으면 그대로 어둡게/안 보이게 뜬다. 흰색으로 덮어써 원본 텍스처 색을 복원한다.
function applyTint(model: Live2DModel, colorTheme: ColorTheme, tinted: boolean) {
  const core = model.internalModel.coreModel as unknown as CubismCoreModel;
  const fur = tinted ? hexToRgb(getThemeRoles(colorTheme).body) : { r: 1, g: 1, b: 1 };
  const ids = core.getDrawableIds();
  for (let i = 0; i < ids.length; i++) {
    const { r, g, b } = FUR_DRAWABLES.has(ids[i]) ? fur : { r: 1, g: 1, b: 1 };
    core.setMultiplyColorByRGBA(i, r, g, b, 1);
    core.setOverwriteFlagForDrawableMultiplyColors(i, true);
  }
}
