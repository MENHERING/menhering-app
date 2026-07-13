# 레서판다 AI 생성 → 레이어 분리 → 리깅 가이드 (DIY)

> 경로: **AI로 2D 레서판다 이미지 생성 → 직접 레이어 분리(PSD) → Cubism Editor 리깅**.
> 제작 스펙(부위·파라미터)은 [redpanda-model-spec.md](redpanda-model-spec.md) 참고. 이 문서는 "이미지를 어떻게 얻나"에 집중.

---

## 0. 큰 흐름

```
① AI 생성        ② 레이어 분리         ③ 리깅              ④ 연동
평면 2D 정면 그림 → PSD로 부위 나눔     → Cubism Editor    → Claude가 앱에 배선
(생성기)           +가려진 뒤 채우기      (무료 버전)          (에셋 주면)
```

**성공의 핵심 = ① 단계에서 "리깅하기 쉬운 그림"을 뽑는 것.** 3D 렌더·복잡한 음영·팔이 몸에 붙은 포즈는 나중에 지옥이 된다.

---

## 1. AI 이미지 생성

### 1-1. 어떤 생성기?

| 도구                               | 특징                                         | 상업이용                     |
| ---------------------------------- | -------------------------------------------- | ---------------------------- |
| **니지저니(NijiJourney)/미드저니** | 2D 애니체 최고 퀄, 유료                      | 유료 플랜 시 가능(약관 확인) |
| **DALL·E 3 (ChatGPT)**             | 자연어로 쉬움, 접근성 좋음                   | 약관 확인                    |
| **Stable Diffusion(무료/로컬)**    | 무료·최대 제어(네거티브 프롬프트), 셋업 필요 | 모델 라이선스 확인           |

> ⚠️ 어떤 도구든 **생성물 상업 이용 약관**을 꼭 확인. 팀 서비스에 쓰려면 중요.

### 1-2. 리깅 친화 원칙 (프롬프트에 꼭 반영)

- **flat 2D anime illustration** (NOT 3D render) — 평면
- **front view, symmetrical** — 정면·좌우대칭
- **arms slightly apart from body** — 팔이 몸에서 떨어짐(분리 쉬움)
- **mouth closed, eyes open, neutral expression** — 중립 표정(리깅 기준 포즈)
- **thick clean outlines, soft flat colors / light cel shading** — 두꺼운 외곽선·평면색(음영 최소)
- **plain white background** — 배경 단순(누끼 쉬움)
- 음영·광택 과하면 레이어 경계에 그림자가 걸려 분리·틴트가 어려워짐 → **은은하게**

### 1-3. 복붙용 프롬프트 (니지/미드저니)

```
cute chibi red panda mascot, flat 2D anime illustration, front view, symmetrical,
standing, big sparkly round eyes, cream white face, dark reddish-brown eye patches,
small ears with cream inner fur, fluffy striped tail to the side, orange rust fur,
tiny paws slightly apart from body, mouth closed, neutral friendly expression looking
at viewer, thick clean outlines, soft flat colors, light cel shading, kawaii game
character design, plain white background, full body character reference
--niji 6 --ar 3:4
```

- 상반신만 원하면 `full body` → `upper body bust`, `--ar 1:1`.

### 1-4. DALL·E 3 (자연어) 버전

```
귀여운 아기 레서판다 마스코트 캐릭터를 그려줘. 평면 2D 애니메이션 일러스트 스타일,
정면, 좌우대칭, 큰 반짝이는 동그란 눈, 크림색 얼굴, 눈 주변 진한 적갈색 무늬,
안쪽이 크림색인 작은 귀, 옆으로 늘어진 줄무늬 꼬리, 주황빛 털. 팔은 몸에서 살짝 떨어뜨리고,
입은 다물고 중립적인 표정으로 정면을 봐. 두꺼운 외곽선, 부드러운 평면 색, 음영은 최소.
배경은 단색 흰색. 3D 렌더 말고 납작한 2D로.
```

### 1-5. Stable Diffusion 네거티브 프롬프트

```
3d render, realistic, photo, blurry, multiple views, extra limbs, fused arms,
complex background, watermark, text, signature, dramatic lighting, harsh shadows,
motion blur, cropped, deformed
```

### 1-6. 뽑을 때 팁

- **여러 장 생성** 후 고른다. 고르는 기준: ①좌우대칭 ②팔이 몸에 안 붙음 ③꼬리가 옆으로 빠짐 ④눈·귀·꼬리가 뚜렷이 구분됨 ⑤음영 단순.
- 첫판에 완벽 안 나옴 — **반복 필수**. 마음에 드는 색감/실루엣 나오면 그걸 기준으로 재생성.
- 이 그림이 **4종 캐릭터 톤의 기준**이 되니, 나중에 토끼·강아지도 같은 프롬프트 틀로 뽑으면 통일감 남.

---

## 2. 레이어 분리 (flat 이미지 → PSD)

이게 **DIY의 진짜 노동 단계**. 목표: 미니멀 리그에 필요한 부위를 각 레이어로 오려내고, **가려진 뒷부분을 채워** 온전하게 만든다.

### 2-1. 도구

- **Photopea** (무료, 브라우저, PSD 지원) — 설치 없이 바로
- **Krita** (무료, 설치) / **Photoshop**(유료) / **Clip Studio**(유료)

### 2-2. 분리할 부위 (미니멀 스코프)

스펙 §2-0 기준:

- 귀 L / 귀 R (+귀끝 털)
- 윗눈꺼풀 L / R
- 눈동자 + 하이라이트 L / R
- 꼬리 마디 1~4
- 팔+손 L / R
- **나머지 전부 고정**(머리·얼굴 크림·몸·발·코·입) → 1~2 레이어로 묶어도 됨

### 2-3. 순서

1. AI 이미지 열기 → **배경 제거**(누끼). (remove.bg 같은 도구 or 수동)
2. 부위별로 **선택 → 잘라 새 레이어**로. 레이어 이름 = 위 목록대로.
3. **가려진 뒤 채우기(핵심):** 앞 부위가 덮은 뒤쪽을 **온전히 그려 넣음**.
   - 예: 윗눈꺼풀을 분리하면, 그 아래 **눈동자를 위쪽까지 완전한 형태로** 그려야 눈 감았다 뜰 때 자연스러움.
   - 예: 팔이 가린 몸통·배도 이어서 채움.
   - (복제 도장/브러시로 채색. 이 부분이 제일 손 많이 감.)
4. 폴더로 그룹핑: `head/`, `body/`, `tail/`.
5. **PSD로 저장**(레이어 보존).

### 2-4. 팁

- 애초에 1-2 원칙대로 **팔을 몸에서 떨어뜨려 생성**하면 채울 영역이 줄어든다.
- "AI가 알아서 레이어 분리해준다"는 툴/서비스가 일부 있으나 **품질 들쭉날쭉** → 초안 정도로만, 결국 손보정 필요.
- 캔버스는 정사각(예 2048×2048), 캐릭터 중앙, 배경 투명.

---

## 3. 리깅 (PSD → Live2D 모델)

1. **Cubism Editor FREE** 다운로드 (live2d.com → Download). 이 규모(1캐릭터)는 무료로 충분.
2. PSD 임포트 → 레이어가 각각 변형 가능한 메시로 들어옴.
3. 스펙 §2-0 파라미터 리깅: 눈 깜빡임 · 눈동자(시선) · 귀/꼬리 물리 · 호흡 · 손 흔들기.
4. 초보 튜토리얼: 공식 Live2D 튜토리얼 + 유튜브 "Live2D 리깅 입문" 다수.
5. 완성 → **.model3.json / .moc3 / 텍스처 / .physics3.json 세트로 익스포트**.

---

## 4. 완성 후

익스포트한 에셋 세트를 주면 → **Claude가 앱에 연동**(스펙 §4: idle·깜빡·포인터·탭·테마 틴트 배선). POC로 방식 검증 완료.

---

## 5. 현실 체크

- ①~③은 **반복·손보정이 많은 사람 작업**이다. 특히 §2-3의 "가려진 뒤 채우기".
- 첫 모델은 **최대한 심플하게**(미니멀 리그) 만들어 완주하는 걸 목표로. 완성 경험 후 디테일↑.
- 막히면: AI 생성 결과를 공유해줘 → **리깅 관점에서 이 그림이 쓸만한지(대칭·분리성) 봐줄게.**
