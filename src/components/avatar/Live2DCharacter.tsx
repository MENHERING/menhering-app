'use client';

import { useEffect, useRef, useState } from 'react';

import type { Live2DModel } from 'pixi-live2d-display-lipsyncpatch/cubism4';
import { Application, settings, UPDATE_PRIORITY } from 'pixi.js';

import { getThemeRoles } from '@/constants/avatar';
import { cn } from '@/lib/cn';
import type { ColorTheme } from '@/types/avatar';

// Live2D 캐릭터 렌더러. 커스텀 모델을 WebGL로 띄우고, 물리 없이 코드로 모션
// (자동 깜빡임·귀/꼬리/하트 흔들림·호흡·포인터 반응)을 구동한다. 리깅 파라미터는
// "모양"만 제공하고 실제 움직임 값은 여기서 흔들어 만든다.
//
// ⚠️ 사용법·제약(싱글톤=동시 1개만)·재마운트 버그 원인/해결은 docs/live2d/frontend-integration.md 참고.
//
// 색은 드로어블별 Multiply(per-part)로 칠한다 — 털(body_fur/tail/arm)만 테마색을 곱하고
// 크림 무늬·눈·하트(body_base/eye/heart)는 원본 텍스처 색을 유지한다. applyTint 참고.

// 자체 호스팅한 Cubism Core 런타임(프로퍼티어리라 npm 미배포). cubism4 모듈 import 전에 로드돼야 한다.
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

// 테마 body색을 곱할 드로어블(재리깅으로 크림과 분리됨). 나머지는 흰색(1,1,1)으로 덮어써
// 원본 텍스처 색을 유지한다. 눈은 통짜 드로어블(eye_L/eye_R)이라 여기 넣으면 눈동자·흰
// 반짝이까지 다 물든다 → 제외(고정). 반사광만 테마색 하려면 눈을 base/reflection으로 분리
// 재리깅한 뒤 reflection 드로어블 id를 여기 추가한다.
const BODY_TINT_DRAWABLES = new Set(['body_fur', 'tail', 'arm_L', 'arm_R']);

// pixi Application/WebGL 컨텍스트를 페이지 세션 내내 하나만 두고 재사용한다.
// 컨텍스트를 파괴·재생성하면 플러그인(Cubism)의 셰이더·마스크가 첫 컨텍스트에 묶인 채 orphan돼,
// SPA 재마운트(탭 이동 후 복귀) 시 렌더가 에러 없이 빈 화면이 된다. 컨텍스트를 살려두면 방지된다.
// (Live2D 히어로/POC는 한 번에 하나만 마운트되므로 싱글톤이 안전하다.)
let sharedApp: Application | null = null;

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
  // 탭 반응(귀 쫑긋 + 하트 뿅). ticker가 reactionRef를 읽어 파라미터를 흔들고, hearts는 DOM 오버레이.
  const reactionRef = useRef({ active: false, t: 0 });
  const heartIdRef = useRef(0);
  const [hearts, setHearts] = useState<number[]>([]);
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

        applyTint(model, colorThemeRef.current, tintedRef.current);

        if (reduceMotion) {
          model.update(16); // 정적 렌더: 드로어블을 1회 배치만 하고 움직임 없음
          return;
        }

        const core = model.internalModel.coreModel as unknown as CubismCoreModel;
        const setP = (id: string, v: number) => core.setParameterValueById(id, v);
        const ticker = app.ticker;

        // 전역 Ticker.shared 대신 app.ticker로 구동(HIGH: app 렌더 전에 update가 반영되도록).
        tickerFn = () => {
          if (disposed) return;
          const dt = ticker.deltaMS / 1000;
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
  // 탭하면 귀 쫑긋 + 하트 뿅. reduce-motion이면 반응 생략(효과음은 상위에서 유지).
  const handleTap = () => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }
    reactionRef.current = { active: true, t: 0 };
    const base = heartIdRef.current;
    heartIdRef.current += 3;
    setHearts((prev) => [...prev, base, base + 1, base + 2]);
  };
  const removeHeart = (id: number) => setHearts((prev) => prev.filter((h) => h !== id));

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
      {hearts.length > 0 && (
        // 클리핑 없음 → 하트가 머리 위 캔버스 밖(숲 하늘)까지 떠오른다. 카드 overflow가 최종 클립.
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          {hearts.map((id) => (
            <span
              key={id}
              onAnimationEnd={() => removeHeart(id)}
              className={cn(
                'animate-heart-float text-primary absolute top-[12%] text-xl',
                id % 3 === 0 && 'left-[36%]',
                id % 3 === 1 && 'left-1/2 text-2xl',
                id % 3 === 2 && 'left-[58%]',
              )}
            >
              ♥
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// 부위별 틴트. 모든 드로어블의 Multiply를 명시적으로 덮어쓴다 — 털(BODY_TINT_DRAWABLES)은
// 테마색, 나머지(크림·눈·코·하트)는 흰색(1,1,1). overwrite 플래그를 켜 매 프레임 유지시킨다.
//
// ⚠️ 나머지를 흰색으로 "명시" 덮어써야 하는 이유: 이 플러그인은 0.4.0과 달리 드로어블별 baked
// Multiply를 실제로 렌더한다. 재리깅 모델의 일부 드로어블(눈 등)에 흰색 아닌 baked 값이 남아
// 있으면 그대로 어둡게/안 보이게 뜬다. 흰색으로 덮어써 원본 텍스처 색을 복원한다.
function applyTint(model: Live2DModel, colorTheme: ColorTheme, tinted: boolean) {
  const core = model.internalModel.coreModel as unknown as CubismCoreModel;
  const tint = tinted ? hexToRgb(getThemeRoles(colorTheme).body) : { r: 1, g: 1, b: 1 };
  const ids = core.getDrawableIds();
  for (let i = 0; i < ids.length; i++) {
    const { r, g, b } = BODY_TINT_DRAWABLES.has(ids[i]) ? tint : { r: 1, g: 1, b: 1 };
    core.setMultiplyColorByRGBA(i, r, g, b, 1);
    core.setOverwriteFlagForDrawableMultiplyColors(i, true);
  }
}
