'use client';

import { useEffect, useRef, useState } from 'react';

// Live2D 아바타 렌더러 (검증용 POC). 커스텀 레서판다 모델을 CDN 런타임으로 띄우고,
// 물리 없이 코드로 모션(자동 깜빡임·귀/꼬리/하트 흔들림·호흡·포인터 반응)을 구동한다.
// 리깅은 파라미터 "모양"만: 나머지 움직임은 여기서 값을 흔들어 만든다.

const SCRIPTS = [
  'https://cdn.jsdelivr.net/npm/pixi.js@7.4.2/dist/pixi.min.js',
  'https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js',
  'https://cdn.jsdelivr.net/npm/pixi-live2d-display@0.4.0/dist/cubism4.min.js',
];

// public/ 아래 export한 우리 모델
const MODEL_URL = '/live2d/redpanda/menhering.model3.json';

// 테마 색 (부위별 멀티플라이가 plugin 0.4.0엔 없어 전체 틴트로 데모)
interface Theme {
  key: string;
  label: string;
  hex: string;
  rgb: { r: number; g: number; b: number } | null;
}

const THEMES: Theme[] = [
  { key: 'none', label: '원본', hex: '#e8e8e8', rgb: null },
  { key: 'lavender', label: '라벤더', hex: '#B8A6E8', rgb: { r: 0.72, g: 0.65, b: 0.91 } },
  { key: 'mint', label: '민트', hex: '#7FD1B0', rgb: { r: 0.5, g: 0.82, b: 0.69 } },
  { key: 'sky', label: '하늘', hex: '#7FB8E8', rgb: { r: 0.5, g: 0.72, b: 0.91 } },
];

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const el = document.createElement('script');
    el.src = src;
    el.async = false;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error(`스크립트 로드 실패: ${src}`));
    document.head.appendChild(el);
  });
}

export function Live2dPoc() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const modelRef = useRef<any>(null);
  const pointerRef = useRef({ x: 0, active: false });
  const [status, setStatus] = useState('초기화 중…');
  const [activeKey, setActiveKey] = useState('none');

  useEffect(() => {
    let disposed = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let app: any = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let PIXI: any = null;
    let tickerFn: (() => void) | null = null;

    // 모션 상태
    let t = 0; // 누적 시간(초)
    let blinking = false;
    let blinkT = 0;
    let nextBlink = 2 + Math.random() * 2;

    async function init() {
      try {
        setStatus('런타임 로드 중…');
        for (const src of SCRIPTS) await loadScript(src);
        if (disposed) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        PIXI = (window as any).PIXI;
        if (!PIXI?.live2d?.Live2DModel) throw new Error('PIXI.live2d 전역이 없습니다.');

        app = new PIXI.Application({
          view: canvasRef.current,
          width: 360,
          height: 460,
          backgroundAlpha: 0,
          antialias: true,
          autoDensity: true,
          resolution: window.devicePixelRatio || 1,
        });

        setStatus('레서판다 모델 로드 중…');
        const model = await PIXI.live2d.Live2DModel.from(MODEL_URL, { autoInteract: false });
        if (disposed) return;

        const baseScale = (app.renderer.height / model.height) * 0.92;
        model.scale.set(baseScale);
        model.anchor.set(0.5, 0.5);
        model.position.set(app.renderer.width / 2, app.renderer.height / 2);
        app.stage.addChild(model);
        modelRef.current = model;

        const core = model.internalModel.coreModel;
        const setP = (id: string, v: number) => core.setParameterValueById(id, v);

        // 프레임마다 모션 구동 (모델 업데이트 이후 = LOW priority)
        tickerFn = () => {
          if (disposed) return;
          const dt = PIXI.Ticker.shared.deltaMS / 1000;
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

          // 포인터 반응 (없으면 0으로 감쇠)
          const px = pointerRef.current.active ? pointerRef.current.x : 0;
          model.rotation = px * 0.05; // 살짝 기울여 따라보는 느낌

          // 귀·꼬리·하트 idle 흔들림 (서로 다른 주기/위상 + 포인터 편향)
          // 폭을 낮게: 꼬리는 크게 흔들면 뿌리가 몸에서 떨어져 보임
          setP('ParamEarSway', 5 * Math.sin(t * 1.6) + px * 3);
          setP('ParamTailSway', 1.5 * Math.sin(t * 1.15 + 0.7) + px * 0.5);
          setP('ParamHeartSway', 6 * Math.sin(t * 2.1 + 1.3));

          // 호흡 (모델 세로 스케일 미세 진동)
          model.scale.set(baseScale, baseScale * (1 + 0.012 * Math.sin(t * 1.3)));
        };
        PIXI.Ticker.shared.add(tickerFn, null, PIXI.UPDATE_PRIORITY.LOW);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__l2d = { app, model, core };
        setStatus(
          '✅ 렌더링 중 — 자동 깜빡임·귀/꼬리/하트 흔들림·호흡. 캔버스 위에서 마우스 움직여봐',
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setStatus(`❌ 실패: ${msg}`);

        console.error('[live2d-poc]', err);
      }
    }

    init();
    return () => {
      disposed = true;
      if (tickerFn && PIXI) PIXI.Ticker.shared.remove(tickerFn);
      if (app) app.destroy(false, { children: true });
    };
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1; // -1 ~ 1
    pointerRef.current = { x: Math.max(-1, Math.min(1, x)), active: true };
  };
  const handlePointerLeave = () => {
    pointerRef.current.active = false;
  };

  const applyTheme = (theme: Theme) => {
    setActiveKey(theme.key);
    const model = modelRef.current;
    if (!model) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const PIXI = (window as any).PIXI;
    if (!theme.rgb) {
      model.filters = [];
      return;
    }
    const { r, g, b } = theme.rgb;
    const f = new PIXI.ColorMatrixFilter();
    f.matrix = [r, 0, 0, 0, 0, 0, g, 0, 0, 0, 0, 0, b, 0, 0, 0, 0, 0, 1, 0];
    model.filters = [f];
  };

  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="bg-coral-soft/40 flex size-[460px] items-center justify-center rounded-3xl">
        <canvas
          ref={canvasRef}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
        />
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {THEMES.map((theme) => (
          <button
            key={theme.key}
            type="button"
            onClick={() => applyTheme(theme)}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition ${
              activeKey === theme.key ? 'border-coral bg-coral-soft/40' : 'border-cream'
            }`}
          >
            <span
              className="size-4 rounded-full border border-black/10"
              // 동적 테마 색 미리보기 → 인라인 배경(임의 hex라 Tailwind 불가)
              style={{ backgroundColor: theme.hex }}
            />
            {theme.label}
          </button>
        ))}
      </div>

      <p className="text-brown-soft max-w-md text-center text-sm">{status}</p>
    </div>
  );
}
