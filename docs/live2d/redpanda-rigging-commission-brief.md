# 레서판다 Live2D "리깅만" 커미션 브리프

> 상황: **레이어 분리된 PSD는 완성**됨. 일러스트/분리 작업 불필요, **리깅(+물리)만** 의뢰.
> 이 문서를 리거에게 전달하거나, 아래 복붙 브리프를 커미션 폼에 붙여넣으면 됨.

---

## 제공물 (내가 리거에게 주는 것)

- **레이어 분리 완료 PSD** 1개 (정사각 캔버스, 배경 투명)
- 레이어 9개 (이름 그대로):
  - `eye_L`, `eye_R` (눈알+하이라이트, 각각 분리)
  - `ear_L`, `ear_R` (귀, 각각 분리)
  - `arm_L`, `arm_R` (팔+손, 각각 분리)
  - `tail` (꼬리)
  - `heart` (하트 펜던트)
  - `body` (고정 바탕 — 눈 자리는 이미 뒤채움 처리됨)

## 요청 리깅 (미니멀 스코프)

| 움직임          | 파라미터(표준 ID 권장)                       |
| --------------- | -------------------------------------------- |
| 머리 각도       | `ParamAngleX/Y/Z`                            |
| 상체 각도       | `ParamBodyAngleX/Y/Z`                        |
| 눈 깜빡임       | `ParamEyeLOpen`, `ParamEyeROpen` (자동 깜빡) |
| 시선 이동       | `ParamEyeBallX`, `ParamEyeBallY`             |
| 호흡            | `ParamBreath`                                |
| 귀 흔들림       | 물리 (Angle 입력)                            |
| 꼬리 흔들림     | 물리 (Angle 입력)                            |
| 하트 흔들림     | 물리 (Angle 입력)                            |
| 손 흔들기(선택) | 팔 회전 or 탭 모션                           |

- **표준 파라미터 ID를 써주세요** (웹 SDK 자동 연동에 유리).
- 물리(귀·꼬리·하트)는 idle/각도에 반응해 자연스럽게 흔들리도록.

## 납품물 (받아야 하는 것)

- `redpanda.moc3`
- `redpanda.model3.json`
- 텍스처 `.png` (아틀라스)
- `redpanda.physics3.json`
- (선택) idle·tap `motion3.json`
- (선택) 원본 `.cmo3` (추후 수정용 — 있으면 좋음)
- **웹(Cubism SDK for Web)용으로 export**, 사용한 **Cubism 버전 알려주기**
  - (연동 측에서 런타임 버전 맞춤 — 4.x/5.x 무엇이든 버전만 알면 됨)

## 참고 (연동 측 요청)

- 몸통 털·귀·꼬리 등 **색 부위를 별 ArtMesh로 유지**해주세요 (이미 레이어 분리돼 있음). → 앱에서 테마별 색 틴트(부위별 Multiply Color) 예정.

---

## 복붙용 브리프 (한국어)

```
[Live2D 리깅만 의뢰]
- 레이어 분리 완료된 PSD 제공합니다 (9레이어: 양쪽 눈/귀/팔 분리, 꼬리, 하트, body).
- 일러스트/분리 불필요, 리깅+물리만 의뢰합니다.
- 필요한 움직임(미니멀): 눈 깜빡임(자동), 시선, 머리/상체 각도, 호흡, 귀·꼬리·하트 물리 흔들림, (가능하면) 손 흔들기 탭모션.
- 표준 파라미터 ID로 부탁드립니다.
- 납품: moc3 / model3.json / 텍스처 / physics3.json (+가능하면 idle·tap motion, .cmo3 원본), 웹 SDK용 export, 사용 Cubism 버전 알려주세요.
- 용도: 웹앱(Next.js) 아바타. 예산·기간 알려주시면 감사하겠습니다.
```

## 복붙용 브리프 (English)

```
[Live2D rigging only]
- I provide a layer-separated PSD (9 layers: L/R eyes, ears, arms separated, plus tail, heart, body).
- Illustration/separation already done — rigging + physics only.
- Needed (minimal): eye blink (auto), eyeball tracking, head/body angle XYZ, breath, ear/tail/heart pendant physics sway, (if possible) a hand-wave tap motion.
- Please use standard parameter IDs.
- Deliverables: moc3 / model3.json / textures / physics3.json (+ idle & tap motion if possible, and the .cmo3 source), exported for Cubism SDK for Web. Please tell me which Cubism version you used.
- Use case: avatar in a Next.js web app. Please share your price and timeline.
```

---

## 어디서 / 얼마나

- **플랫폼:** 크몽(국내) · Skeb · Booth · Fiverr · coconala · X(트위터)에서 "Live2D 리깅 의뢰 / Live2D rigging commission" 검색
- **비용:** 리깅만이라 풀커미션보단 저렴하지만 리거·복잡도마다 천차만별 → **여러 명한테 견적** 받아 비교
- **고르는 기준:**
  - 포트폴리오에서 **움직임이 자연스러운지**(눈·물리) 확인
  - **SDK 파일 일습(moc3/model3.json/텍스처/physics)** 을 주는지 (영상만 주는 곳 피하기)
  - 웹 SDK export 경험 있는지

## 받은 다음

- 에셋 세트를 나(개발)한테 주면 → 앱에 연동(idle·깜빡·포인터·탭·테마 틴트). POC로 방식 검증 완료.
