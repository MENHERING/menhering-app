# Live2D 프론트 렌더링 연동 가이드

> 목적: 앱에서 Live2D 캐릭터를 **다른 페이지·컴포넌트에서도** 안전하게 띄우기 위한 사용법과 제약·함정 정리.
> 대상 독자: 프론트 연동 개발자.
> 상태: 아바타 히어로(`/avatar`)·POC(`/live2d-poc`)에서 검증 완료.

관련 파일:

- `src/components/avatar/Live2DCharacter.tsx` — 실제 렌더러(pixi + WebGL 구동).
- `src/components/avatar/AvatarHero.tsx` — Live2D/SVG 폴백 스위처(히어로 전용).
- `src/constants/character-registry.ts` — 캐릭터별 렌더 방식(Svg/live2d/thumbnail) 단일 출처.
- 에셋: `public/live2d/redpanda/`(moc3·model3.json·텍스처), `public/live2d/core/live2dcubismcore.min.js`(자체 호스팅 Core).

---

## 1. 스택

- **pixi.js 7** + **pixi-live2d-display-lipsyncpatch**(fork, per-part multiply 색 지원) + **@pixi/core·@pixi/display**(fork가 런타임에 직접 import → 직접 의존성으로 둠).
- **Cubism Core**는 프로퍼티어리라 npm 미배포 → `public/live2d/core/`에 자체 호스팅, `<script>`로 로드. **cubism4 모듈 import 전에 로드돼야 함**(`loadCubismCore()`가 보장).

## 2. 사용법

가장 쉬운 길은 레지스트리에 `live2d`를 달고 `AvatarHero`를 쓰는 것:

```tsx
// character-registry.ts
레서판다: {
  Svg: RedPandaSvg,
  live2d: { modelUrl: '/live2d/redpanda/menhering.model3.json' },
  thumbnail: '/images/avatar/menhering_1_img.webp', // 픽커 얼굴 크롭용(선택)
},
```

```tsx
// 렌더 (히어로 스위처: live2d 있으면 Live2D, 실패 시 SVG 폴백)
<AvatarHero
  characterType={characterType}
  colorTheme={colorTheme}
  mood={mood} // 감정 상태 → 표정 + 만화 심볼·기운 배경(선택, 생략 시 무표정)
  size={288}
  className="size-72"
/>
```

렌더러를 직접 쓰려면:

```tsx
<Live2DCharacter
  modelUrl="/live2d/redpanda/menhering.model3.json"
  colorTheme={colorTheme}
  mood={mood}         // 감정 상태 → 표정(입/눈/눈썹/볼). 생략 시 무표정
  size={288}          // 정사각 캔버스 한 변(px). className(컨테이너)과 맞출 것
  interactive         // 포인터 따라 살짝 기울임
  onError={() => ...} // 로드 실패 시(상위에서 SVG 폴백 권장)
/>
```

- SSR 금지(WebGL). `AvatarHero`는 `dynamic(..., { ssr: false })`로 지연 로드함. 직접 쓸 때도 동일하게.
- `size`는 **캔버스 px**, `className`은 **컨테이너 크기**(SVG 폴백에도 적용). 둘을 일치시킬 것(예: `size={288}` + `size-72`).
- `tinted`(기본 true)를 false로 주면 테마색을 안 곱하고 원본 텍스처 색으로 렌더한다(검증용).

### 2-1. 감정 표정(`mood`)

`mood`(`행복/보통/우울/지침/화남`, `@/types/mypage/model`)를 넘기면 감정→표정이 반영된다.

- **표정 파라미터 매핑**은 `src/constants/mood-expression.ts`(`MOOD_EXPRESSION`)에 값으로 있고, `Live2DCharacter`가 매 프레임 목표값으로 부드럽게 보간(lerp)해 얹는다. `.exp3` 파일이 아니라 **코드에서 파라미터 직접 세팅** 방식이다.
- **`AvatarHero`는 표정 외에** `MoodBackdrop`(기운 배경 타원)·`MoodSymbol`(눈물·하트 등 만화 심볼)도 같이 얹는다. SVG 폴백엔 기운 배경만 반영된다(심볼 좌표가 Live2D 실루엣 기준이라).
- 모델 리깅 상태에 따라 반영되는 채널이 다르다 — 현재 redpanda는 입/눈웃음/볼/눈썹/눈뜸이 작동. 눈뜸(졸린 눈)은 눈 뒤가 `body_fur`라 0.8 미만에서 주황이 드러나는 제약이 있어 지침만 0.8로 얕게 쓴다(상세는 `mood-expression.ts` 주석).

### 2-2. `mood_value`(0~100) → `Mood` 매핑

서버 `avatar_status`는 감정을 **`mood_value` 정수 하나(0~~100)**로만 저장한다. `Mood` 5단계로의 변환은 `src/constants/mood.ts`의 `moodFromValue()`가 전담하며(숫자→`Mood`의 **유일한 출처**), 이 함수는 **route handler(`app/api/avatar-status/route.ts`)에서 호출**해 응답에 `mood` 라벨을 함께 실어 내려준다. 즉 수치→라벨 가공은 서버에서 끝내고 프론트(컴포넌트)는 표시만 한다. `mood_value`(수치)도 함께 내려주는데, 기분 링/게이지가 0~~100 비율로 채우기 때문이다.

**결정(2026-07-13, #42): 20폭 균등 5등분.** 경계값은 더 행복한(위) 구간으로 올린다.

| `mood_value` | `Mood` |
| ------------ | ------ |
| 0 ~ 19       | 화남   |
| 20 ~ 39      | 지침   |
| 40 ~ 59      | 우울   |
| 60 ~ 79      | 보통   |
| 80 ~ 100     | 행복   |

- 조회는 `hooks/avatar/use-avatar-status.ts`(`useAvatarStatus`)가 담당하고, 컴포넌트는 `data.mood`(라벨)·`data.moodValue`(수치)를 골라 쓰기만 한다. 소비처(`AvatarHero`/`Live2DCharacter`/마이페이지 뱃지 등)는 이미 `Mood` 문자열을 받으므로 **바뀌지 않는다**.
- ⚠️ **DB 조회 경로**: `avatar_status`는 유저가 아니라 **아바타에 매달려 있다**(컬럼 `avatar_id` → `avatars.id`). RLS 정책 `본인 조회`(`avatar_id`가 `auth.uid()` 소유 아바타)가 본인 행만 걸러주므로, route는 `getUser`·avatars 조인 없이 `avatar_status`를 **한 번만 조회**한다(느린 회선에서 왕복을 줄이려 3→1). 테이블은 ERD 단계에서 대시보드로 생성됨(마이그레이션 파일 없음) — 이 프로젝트 DB는 대시보드 관리. 이 RLS 정책이 없으면 데이터가 안 걸러져 기본값만 폴백된다.
- 신규 유저(아바타·감정 행 없음)·조회 실패 시 서버가 `DEFAULT_MOOD_VALUE`(60=보통, DB 기본값과 동일)로 폴백한다.
- ⚠️ 앱의 0~100 축은 본래 **행복도**(우울↔행복 1축, `HappinessGauge`/`QuizAvatarRing`)라, **지침·화남은 이 축의 "더 낮은 행복"이 아니라 질적으로 다른 감정**이다. 즉 `화남 < 지침 < 우울` 순서에 행복도상의 의미는 없고 편의상 저구간에 배치한 것뿐이다. 세밀한 부정 감정 구분이 필요해지면 `mood_value` 단일 스칼라로는 부족하므로 별도 신호(연속 오답·타임아웃·스트릭 끊김 등)로 분리해야 한다.
- 범위 밖·`NaN` 값은 `DEFAULT_MOOD`(`보통`)로 폴백한다.

## 3. ⚠️ 제약·함정 (다른 페이지에서 쓰기 전 필독)

### 3-1. 한 번에 하나만 (싱글톤 앱)

`Live2DCharacter`는 **pixi Application/WebGL 컨텍스트를 모듈 싱글톤(`sharedApp`)으로 재사용**한다(이유는 §4). 따라서 **동시에 두 개 이상의 Live2D 인스턴스를 마운트하면 안 된다** — 하나의 컨텍스트/캔버스를 서로 뺏는다.

- 현재는 히어로(`/avatar`)와 POC(`/live2d-poc`)가 **각 라우트에 1개씩**이라 안전.
- 픽커 썸네일 등 **여러 개를 동시에** 보여줘야 하면 Live2D 말고 **SVG/이미지**를 써라(성능상으로도 맞음 — WebGL 캔버스 N개는 무겁다).
- 정말 동시 다중 Live2D가 필요하면 싱글톤 구조를 인스턴스별 앱으로 재설계해야 함(§4 트레이드오프 재검토).

### 3-2. 색 테마 = 회색 털 텍스처 전제

부위별 색은 **드로어블별 Multiply**로 입힌다(`applyTint`: 털만 테마색, 나머지 흰색). Multiply는 곱셈이라 **털 텍스처가 주황이면** 민트 등 다른 테마색을 곱해도 **탁한 색**이 나온다(주황의 낮은 파랑값이 결과를 막음).
→ 깨끗한 테마색을 원하면 **털 드로어블 텍스처를 그레이스케일로** 만들어 재출력해야 함(회색 × 테마색 = 테마색).
→ 이 그레이스케일화는 **`npm run assets:desaturate-fur`**(`scripts/desaturate-fur.mjs`)가 자동으로 한다 — moc3에서 털 드로어블(`body_fur`·`tail`·`arm_L`·`arm_R`) UV를 읽어 그 부분만 회색화(크림·눈·하트는 색 유지). **Cubism에서 텍스처를 재출력하면 원본 주황색으로 돌아오므로, 재출력할 때마다 이 스크립트를 다시 돌려야 한다.** PSD를 회색으로 만들지 말 것(원본 색은 편집 소스로 유지).

### 3-3. HMR 주의(개발 전용)

`Live2DCharacter.tsx` **자체를 편집**하면 HMR이 모듈을 재평가해 싱글톤(`sharedApp`)이 리셋된다 → 그 순간 Live2D가 빈 화면이 됨. **전체 새로고침**하면 복구. 다른 파일 편집은 영향 없고, 프로덕션은 HMR이 없어 무관.

### 3-4. 프레이밍은 논리 픽셀 기준

캔버스 fit은 `app.screen`(논리 px)으로 계산한다. `app.renderer.width`는 device 픽셀(=논리×dpr)이라 dpr>1에서 모델이 dpr배 커져 잘린다. 모델 캔버스에 여백이 있어 쏠리는 건 `getBounds()`로 실제 콘텐츠 중심을 잡아 보정.

## 4. 재마운트 빈 화면 버그 — 원인과 해결 (2026-07-08)

미래에 비슷한 증상이 나면 참고.

**증상**: 아바타 탭을 나갔다 돌아오면 Live2D가 **에러 없이 빈 화면**. 첫 페이지 로드는 정상.

**진단**: 재마운트 시 `Live2DModel.from()` 성공, 모델이 스테이지에 올라감(children=1), 렌더 루프도 돎, 렌더러 존재 — 그런데 렌더만 안 됨. 텍스처는 파괴 안 됨, CubismFramework도 dispose 안 됨.

**근본 원인**: 매 마운트마다 `new Application` + `app.destroy(true)`로 **WebGL 컨텍스트를 파괴·재생성**했는데, 플러그인(Cubism)의 셰이더·마스크가 **첫 GL 컨텍스트에 묶인 채 orphan**돼 두 번째 컨텍스트에선 무효 → 조용히 무렌더.

**해결**:

1. **pixi Application/컨텍스트를 모듈 싱글톤으로 재사용** — 파괴하지 않고 마운트마다 `resize()`+`start()`, 언마운트 땐 모델만 제거·`stop()`·캔버스 detach(`app.destroy` 안 함).
2. **update 루프를 전역 `Ticker.shared`+플러그인 autoUpdate가 아니라 컴포넌트 전용 `app.ticker`로 자기 구동** — `Live2DModel.from(url, { autoUpdate: false, autoHitTest: false, autoFocus: false })` 후, 우리 tick에서 파라미터를 얹고 `model.update()`를 직접 호출. 전역 ticker 상태 의존 제거.

이후 탭 왕복 반복에도 정상 유지 확인.
