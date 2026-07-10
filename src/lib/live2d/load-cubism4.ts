import type { Live2DModel } from 'pixi-live2d-display-lipsyncpatch/cubism4';

// Live2D(Cubism4) 런타임의 **단일 진입점**. 플러그인을 직접 import하지 말고 여기를 거쳐라.
//
// 여기서 두 가지를 보장한다.
//  1. Cubism Core 스크립트가 플러그인 모듈보다 먼저 로드된다(플러그인이 import 시점에 Core를 요구한다).
//  2. ModelSettings.resolveURL이 네이티브 URL로 교체된 뒤에만 모델이 로드된다.
//
// 2번을 컴포넌트 안에서 하면 "그 컴포넌트가 다른 소비자보다 먼저 마운트된다"는 순서 가정에 의존한다.
// 두 번째 기능이 플러그인을 먼저 import해 Live2DModel.from을 부르면 패치를 건너뛰고, 재현하기 어려운
// 순서 의존 버그가 된다. 모듈 하나로 좁혀 두면 import 순서로 우회할 수 없다.

// 자체 호스팅한 Cubism Core 런타임(프로퍼티어리라 npm 미배포).
const CUBISM_CORE_SRC = '/live2d/core/live2dcubismcore.min.js';

// 플러그인의 ModelSettings.resolveURL은 pixi의 `utils.url.resolve`를 쓰는데, 이 API는 pixi 7.3에서
// deprecated라 호출될 때마다 콘솔에 "PixiJS Deprecation Warning" + 스택을 뿜는다(동작은 정상).
// 경로 해석은 우리가 소유하는 편이 낫다 → 네이티브 URL로 갈아끼워 경고를 없앤다.
// model3.json의 상대 경로(예: "menhering.4096/texture_00.png")를 모델 URL 기준으로 푼다.
//
// 프로토타입을 갈아끼워도 zip/File 로더는 안전하다 — FileLoader가 `settings.resolveURL`을
// **인스턴스 레벨**로 덮어쓰므로(dist/cubism4.es.js) 그 경로는 이 프로토타입을 타지 않는다.
interface ModelSettingsClass {
  prototype: { url: string; resolveURL(path: string): string };
}

function patchResolveURL(settingsClass: ModelSettingsClass) {
  settingsClass.prototype.resolveURL = function resolveURL(path: string) {
    return new URL(path, new URL(this.url, window.location.href)).href;
  };
}

function loadCubismCore(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ('Live2DCubismCore' in window) {
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

type Cubism4Module = typeof import('pixi-live2d-display-lipsyncpatch/cubism4');

// 동시 호출·재마운트에도 Core 스크립트와 패치가 한 번만 돌도록 promise를 캐시한다.
let cubism4Promise: Promise<Cubism4Module> | null = null;

/** Cubism4 런타임을 준비하고 모듈을 돌려준다. 브라우저 전용. */
export function loadCubism4(): Promise<Cubism4Module> {
  cubism4Promise ??= (async () => {
    await loadCubismCore();
    const cubism4 = await import('pixi-live2d-display-lipsyncpatch/cubism4');
    patchResolveURL(cubism4.Cubism4ModelSettings);
    return cubism4;
  })().catch((error: unknown) => {
    // 실패한 promise를 캐시에 남기면 다음 마운트가 영원히 같은 실패를 재사용한다(재시도 불가).
    cubism4Promise = null;
    throw error;
  });

  return cubism4Promise;
}

export type { Live2DModel };
