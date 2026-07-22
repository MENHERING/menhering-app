/**
 * Live2D 아바타 털 텍스처 그레이스케일 도구.
 *
 * 왜 필요한가:
 *   Live2DCharacter의 applyTint는 털 드로어블에 테마색을 **곱한다(multiply)**. 곱하기는 어둡게만
 *   만들 수 있어서, 털 텍스처가 회색이어야 `회색 × 민트 = 민트`가 나온다. 주황 털에 민트를 곱하면
 *   주황의 낮은 파랑값이 결과의 파랑을 막아 수학적으로 탁한 갈색밖에 안 나온다.
 *
 * 언제 돌리나:
 *   **Cubism에서 텍스처를 재출력할 때마다.** 아틀라스는 PSD 원본(주황 털)에서 나오므로 재출력하는
 *   순간 그레이스케일이 통째로 날아간다. 2026-07-10에 실제로 이 회귀가 났다.
 *
 * 왜 아틀라스 전체를 회색화하면 안 되나:
 *   applyTint가 털 이외 드로어블(눈·하트·크림·코·입·볼 홍조)은 흰색(1,1,1)으로 곱해 **원본 텍스처
 *   색을 그대로 쓴다**. 통째로 회색화하면 눈 반짝임과 볼 홍조가 죽는다. 그래서 moc3에서 털
 *   드로어블의 UV 바운딩 박스만 읽어 그 안만 건드린다(박스가 다른 드로어블과 겹치면 중단한다).
 *
 * 사용법: npm run assets:desaturate-fur
 */
import { readFileSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';

import sharp from 'sharp';

const CORE_SRC = 'public/live2d/core/live2dcubismcore.min.js';
const TINT_DRAWABLES_JSON = 'src/constants/live2d-tint-drawables.json';

// 종별 moc/텍스처 경로. whitePoint를 명시하면 그 값을, 없으면 입력 명도 p50에서 자동 산출한다(아래).
// 사용법: node scripts/desaturate-fur.mjs <캐릭터>  (기본 레서판다)
//
// ⚠️ 정책(2026-07-22): 기본 테마가 '무색'(원화색)으로 바뀌어, 고양이·강아지·토끼는 **원본 컬러
// 텍스처를 유지**한다(무색=원화색). 이 셋에 desaturate를 돌리면 무색이 회색이 되니 돌리지 말 것.
// 회색화는 레서판다 전용(텍스처가 이미 회색이고 테마 틴트로 색을 입힘). 재리깅해도 레서판다만.
const CONFIG = {
  레서판다: {
    moc: 'public/live2d/redpanda/menhering.moc3',
    texture: 'public/live2d/redpanda/menhering.4096/texture_00.png',
    // 225 = develop 승인본(털 회색값 p50≈170)에 맞춘 고정값. 회귀 방지 위해 그대로 유지.
    whitePoint: 225,
  },
  고양이: {
    moc: 'public/live2d/cat/cat.moc3',
    texture: 'public/live2d/cat/cat.4096/texture_00.png',
  },
  강아지: {
    moc: 'public/live2d/dog/dog.moc3',
    texture: 'public/live2d/dog/dog.4096/texture_00.png',
  },
  토끼: {
    moc: 'public/live2d/rabbit/rabbit.moc3',
    texture: 'public/live2d/rabbit/rabbit.4096/texture_00.png',
  },
};

const CHARACTER = process.argv[2] ?? '레서판다';
const cfg = CONFIG[CHARACTER];
if (!cfg)
  throw new Error(`알 수 없는 캐릭터: ${CHARACTER}. (${Object.keys(CONFIG).join(' / ')} 중 하나)`);
const MOC = cfg.moc;
const TEXTURE = cfg.texture;

// 런타임(applyTint의 tintDrawables)과 **같은 파일**의 같은 캐릭터 항목을 읽는다(캐릭터→드로어블 맵).
// 손으로 복사해두면 재리깅 때 한쪽만 고쳐져, 틴트는 되는데 회색화가 안 된 부위가 갈색으로 뜬다.
const FUR_DRAWABLES = new Set(JSON.parse(readFileSync(TINT_DRAWABLES_JSON, 'utf8'))[CHARACTER]);

// Photopea "Desaturate"와 같은 HSL 명도 (max+min)/2 를 쓴 뒤, Levels 흰점을 whitePoint로 올린다.
// 표준 휘도(0.2126R+0.7152G+0.0722B)를 쓰면 진빨강이 거의 검정이 돼 곱하기 결과가 새까매진다.
// 종별 whitePoint는 아래에서 결정한다(고정값 or 자동): 출력 회색값 p50이 이 목표로 오게 한다.
const TARGET_P50 = 170;

// 이미 회색인 텍스처를 또 돌리면 흰점 보정이 중첩돼 점점 밝아진다 → 채도로 감지해 건너뛴다.
const ALREADY_GRAY_SATURATION = 0.05;

/** Cubism Core는 브라우저용 번들이라 Node에 없는 전역을 채워 샌드박스에서 평가한다. */
async function loadCubismCore() {
  const sandbox = {
    console,
    TextDecoder,
    TextEncoder,
    WebAssembly,
    performance,
    Uint8Array,
    Float32Array,
    Int32Array,
    ArrayBuffer,
    Math,
    Date,
    Object,
    Array,
    Error,
    Promise,
    setTimeout,
    clearTimeout,
    queueMicrotask,
    atob: (b64) => Buffer.from(b64, 'base64').toString('binary'),
    document: { currentScript: null, createElement: () => ({}), head: { appendChild: () => {} } },
    navigator: { userAgent: 'node' },
  };
  sandbox.globalThis = sandbox;
  sandbox.window = sandbox;
  sandbox.self = sandbox;
  createContext(sandbox);
  runInContext(readFileSync(CORE_SRC, 'utf8'), sandbox);

  // wasm 초기화가 비동기라 준비될 때까지 기다린다.
  const core = sandbox.Live2DCubismCore;
  for (let i = 0; i < 200; i++) {
    try {
      core.Version.csmGetVersion();
      return core;
    } catch {
      await new Promise((r) => setTimeout(r, 25));
    }
  }
  throw new Error('Cubism Core 초기화 실패');
}

/** 드로어블별 UV 바운딩 박스. 좌표를 손으로 박지 않아야 재리깅에도 안 깨진다. */
function readUvBoxes(core) {
  const bytes = readFileSync(MOC);
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  const model = core.Model.fromMoc(core.Moc.fromArrayBuffer(buffer));
  const { count, ids, vertexUvs } = model.drawables;

  const boxes = [];
  for (let i = 0; i < count; i++) {
    const uvs = vertexUvs[i];
    let u0 = 1,
      v0 = 1,
      u1 = 0,
      v1 = 0;
    for (let k = 0; k < uvs.length; k += 2) {
      if (uvs[k] < u0) u0 = uvs[k];
      if (uvs[k] > u1) u1 = uvs[k];
      if (uvs[k + 1] < v0) v0 = uvs[k + 1];
      if (uvs[k + 1] > v1) v1 = uvs[k + 1];
    }
    boxes.push({ id: ids[i], isFur: FUR_DRAWABLES.has(ids[i]), u0, v0, u1, v1 });
  }
  return boxes;
}

/**
 * 털 박스가 **다른** 드로어블 박스를 물면 회색화가 눈·하트까지 먹는다 → 그때는 아무것도 하지 않는다.
 * 털끼리 겹치는 건 여기서 막지 않는다 — collectFurPixels가 마스크로 중복 방문을 제거한다.
 */
function assertNoOverlap(boxes) {
  const fur = boxes.filter((b) => b.isFur);
  const others = boxes.filter((b) => !b.isFur);
  const hits = [];
  for (const f of fur) {
    for (const o of others) {
      if (f.u0 < o.u1 && o.u0 < f.u1 && f.v0 < o.v1 && o.v0 < f.v1) hits.push(`${f.id} × ${o.id}`);
    }
  }
  if (hits.length) {
    throw new Error(
      `털 UV 박스가 다른 드로어블과 겹칩니다: ${hits.join(', ')}\n` +
        '박스 단위 회색화가 눈·하트·볼 홍조를 덮칩니다. 아틀라스 패킹을 다시 확인하세요.',
    );
  }
  if (!fur.length)
    throw new Error(`moc3에 털 드로어블이 없습니다: ${[...FUR_DRAWABLES].join(', ')}`);
  return fur;
}

/** Live2D UV는 좌하단 원점 → PNG 행 좌표로 뒤집는다. */
function toPixelRect(box, width, height) {
  return {
    x0: Math.floor(box.u0 * width),
    x1: Math.ceil(box.u1 * width),
    y0: Math.floor((1 - box.v1) * height),
    y1: Math.ceil((1 - box.v0) * height),
  };
}

/**
 * 처리할 픽셀 오프셋 목록. 박스를 그대로 순회하면 **털 박스끼리 겹칠 때 같은 픽셀을 두 번 방문**해
 * 흰점 보정이 두 번 곱해진다(그 구역만 밝은 패치로 남는다). 마스크로 한 번 걸러 중복을 없앤다.
 * 현재 모델도 arm_L(v 끝 0.5479)과 arm_R(v 시작 0.5547)이 0.007차로 간신히 비껴 있어 안전마진이 없다.
 */
function collectFurPixels(data, width, height, rects) {
  const seen = new Uint8Array(width * height);
  const offsets = [];
  for (const { x0, x1, y0, y1 } of rects) {
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        const p = y * width + x;
        if (seen[p]) continue;
        seen[p] = 1;
        if (data[p * 4 + 3] === 0) continue;
        offsets.push(p * 4);
      }
    }
  }
  return offsets;
}

const core = await loadCubismCore();
const furBoxes = assertNoOverlap(readUvBoxes(core));

const { data, info } = await sharp(TEXTURE)
  .raw()
  .ensureAlpha()
  .toBuffer({ resolveWithObject: true });
const { width, height } = info;
const rects = furBoxes.map((b) => toPixelRect(b, width, height));
const furOffsets = collectFurPixels(data, width, height, rects);

if (!furOffsets.length) {
  throw new Error(
    `털 박스(${furBoxes.map((b) => b.id).join(', ')}) 안에 불투명 픽셀이 하나도 없습니다.\n` +
      'moc3의 UV와 아틀라스가 어긋난 것으로 보입니다. 내보내기를 다시 확인하세요.',
  );
}

let saturationSum = 0;
for (const i of furOffsets) {
  const max = Math.max(data[i], data[i + 1], data[i + 2]);
  const min = Math.min(data[i], data[i + 1], data[i + 2]);
  saturationSum += max === 0 ? 0 : (max - min) / max;
}
const meanSaturation = saturationSum / furOffsets.length;

if (meanSaturation < ALREADY_GRAY_SATURATION) {
  console.log(`털이 이미 그레이스케일입니다 (평균 채도 ${meanSaturation.toFixed(3)}). 건너뜁니다.`);
  process.exit(0);
}

// whitePoint: 명시값(레서판다)이 있으면 그대로, 없으면 입력 털 명도 p50이 TARGET_P50로 오도록 자동.
// 탄색·분홍 털은 명도가 높아 고정 225면 결과가 너무 밝아(곱하기 시 테마색이 옅게 씻김) → 종별 자동 산출.
let whitePoint = cfg.whitePoint;
if (whitePoint == null) {
  const lightHist = new Uint32Array(256);
  let opaque = 0;
  for (const i of furOffsets) {
    if (data[i + 3] < 250) continue;
    const max = Math.max(data[i], data[i + 1], data[i + 2]);
    const min = Math.min(data[i], data[i + 1], data[i + 2]);
    lightHist[Math.round((max + min) / 2)]++;
    opaque++;
  }
  let seen = 0;
  let inputP50 = 128;
  for (let g = 0; g < 256; g++) {
    seen += lightHist[g];
    if (seen > 0.5 * (opaque - 1)) {
      inputP50 = g;
      break;
    }
  }
  whitePoint = Math.max(1, Math.round((inputP50 * 255) / TARGET_P50));
  console.log(
    `자동 whitePoint: 입력 명도 p50=${inputP50} → whitePoint=${whitePoint} (목표 출력 p50=${TARGET_P50})`,
  );
}

// 변환은 반투명 가장자리(안티앨리어싱)까지 포함해 모든 픽셀에 적용한다.
// 다만 요약 통계는 **완전 불투명 픽셀만** 센다 — 어두운 가장자리가 섞이면 p50이 끌려 내려가
// 기준선(회색값 p50≈170, 불투명 기준 측정)과 비교가 안 된다.
// 회색값은 0~255 정수라 히스토그램이면 충분하다(백만 개짜리 배열 정렬 불필요).
const histogram = new Uint32Array(256);
for (const i of furOffsets) {
  const max = Math.max(data[i], data[i + 1], data[i + 2]);
  const min = Math.min(data[i], data[i + 1], data[i + 2]);
  const gray = Math.min(255, Math.round(((max + min) / 2) * (255 / whitePoint)));
  data[i] = data[i + 1] = data[i + 2] = gray;
  if (data[i + 3] >= 250) histogram[gray]++;
}

await sharp(data, { raw: { width, height, channels: 4 } })
  .png({ compressionLevel: 9 })
  .toFile(TEXTURE);

const opaqueCount = histogram.reduce((sum, n) => sum + n, 0);
const percentile = (p) => {
  let seen = 0;
  const target = p * (opaqueCount - 1);
  for (let gray = 0; gray < 256; gray++) {
    seen += histogram[gray];
    if (seen > target) return gray;
  }
  return 255;
};

console.log(`털 드로어블: ${furBoxes.map((b) => b.id).join(', ')}`);
console.log(
  `픽셀 ${furOffsets.length.toLocaleString()}개 회색화 (평균 채도 ${meanSaturation.toFixed(3)} → 0.000)`,
);
console.log(
  `불투명 픽셀 회색값 p10=${percentile(0.1)} p50=${percentile(0.5)} p90=${percentile(0.9)}` +
    ' (develop 기준선 29 / 170 / 220)',
);
console.log(`→ ${TEXTURE}`);
