# MENHERING APP

> 로고는 추후 추가 예정

**사용자 참여도에 따른 감정 변화 학습 동기부여 서비스 — 모바일 우선 PWA 팀 프론트엔드**

## 🌊 MENHERING : 학습하고, 교감하고, 꾸미고, 성장하세요

> **감정형 마스코트 아바타와 게임형 학습 시스템을 결합한 설치형 모바일 학습 PWA 앱**의 프론트엔드 저장소입니다.  
> Google 로그인으로 입장해 학습 레벨을 설정하고, 문제 풀이와 아바타 상호작용을 통해 **지속적인 학습 루틴**을 만들어갑니다.

## 📌 MENHERING은 이런 서비스예요

MENHERING은  
**사용자의 학습 참여도에 따라 감정 상태가 변화하는 마스코트와 함께 학습을 이어가는** 모바일 우선 PWA 학습 앱입니다.

- **Google 소셜 로그인** 기반으로 간편하게 시작
- **온보딩 + 홈·학습·아바타·마이페이지** 흐름으로 구성
- **학습 참여도, 감정 상태, 스트릭, 스테이지 진행도**를 함께 관리
- **문제 풀이 + 점프 러닝 UI + 아바타 커스터마이징**을 결합한 몰입형 경험 제공
- **PWA 기반 설치 및 기본 오프라인 접근**을 고려한 앱형 경험 제공

> “학습을 의무가 아니라, 감정적으로 교감하는 놀이처럼 지속할 수 있는 경험”

## 🙋 MENHERING FE 팀 역할

| 역할             | 책임                                                              |
| ---------------- | ----------------------------------------------------------------- |
| Core Engineer    | 학습 진행 로직, 상태 설계, 문제 세션 흐름, 데이터 모델 연동       |
| UX Engineer      | 홈·학습·아바타·마이페이지 UI, 모바일 UX, 접근성                   |
| Infra Engineer   | Next.js 구조, Supabase 연동, PWA 설정, 프로젝트 환경 구성         |
| Product Engineer | 감정 상태 설계, 학습 동기 흐름, 기능 우선순위 및 사용자 경험 정리 |

## 🙋‍♀️ MENHERING의 FE Developer를 소개합니다!

| <a href="https://github.com/dew2314"><img src="https://avatars.githubusercontent.com/u/145005522?v=4" width="120" alt="강이슬" /></a> | <a href="https://github.com/ParkSi-Yeol"><img src="https://avatars.githubusercontent.com/u/162967437?v=4" width="120" alt="박시열" /></a> | <a href="https://github.com/Hyejinjin-An"><img src="https://avatars.githubusercontent.com/u/115617565?v=4" width="120" alt="안혜진" /></a> | <a href="https://github.com/seongmin36"><img src="https://avatars.githubusercontent.com/u/202721995?v=4" width="120" alt="조성민" /></a> |
| ------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 강이슬 (팀장)                                                                                                                         | 박시열                                                                                                                                    | 안혜진                                                                                                                                     | 조성민                                                                                                                                   |

## 💻 기술 스택

| **분류**         | **기술**                                                                                                                                                                                                                                                                                                                                                                                                                    | **선정 이유**                                                                                              |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Framework        | <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white">                                                                                                                                                                                                                                                                                                                    | App Router 기반으로 화면 흐름과 라우팅을 일관되게 관리, 서버 컴포넌트·Route Handler를 한 프레임워크로 통합 |
| Library          | <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=React&logoColor=white">                                                                                                                                                                                                                                                                                                                        | 컴포넌트 기반 구조로 재사용성과 유지보수성을 높여 복잡한 학습 UI를 안정적으로 구성                         |
| Language         | <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white">                                                                                                                                                                                                                                                                                                              | `any` 금지·엄격한 타입으로 API 응답·폼·상태 전반의 런타임 오류를 컴파일 타임에 차단                        |
| Styling          | <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white">                                                                                                                                                                                                                                                                                                           | 유틸리티 클래스 기반으로 반복 CSS 없이 공통 컴포넌트(`components/common`) 조합만으로 빠르고 일관된 UI 구현 |
| State Management | <img src="https://img.shields.io/badge/TanStack_Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white"> <img src="https://img.shields.io/badge/Zustand-433E38?style=for-the-badge">                                                                                                                                                                                                                              | 서버 상태(API 캐싱·재검증)는 TanStack Query, 아바타·오답노트 등 클라이언트 UI 상태는 Zustand로 역할 분리   |
| Validation       | <img src="https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white">                                                                                                                                                                                                                                                                                                                            | Route Handler와 `react-hook-form` 양쪽에서 재사용하는 요청/응답 스키마의 단일 소스                         |
| Form             | <img src="https://img.shields.io/badge/React_Hook_Form-EC5990?style=for-the-badge&logo=reacthookform&logoColor=white">                                                                                                                                                                                                                                                                                                      | 온보딩·설정 등 폼 입력의 검증·상태 관리를 가볍게 처리                                                      |
| Backend / DB     | <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white">                                                                                                                                                                                                                                                                                                                  | 인증, 데이터 저장, RLS 기반 접근 제어, SECURITY DEFINER RPC까지 빠르게 통합 가능한 백엔드 플랫폼           |
| Auth             | <img src="https://img.shields.io/badge/Google-4285F4?style=for-the-badge&logo=google&logoColor=white"> <img src="https://img.shields.io/badge/Kakao-FFCD00?style=for-the-badge&logo=kakaotalk&logoColor=000000">                                                                                                                                                                                                            | 진입 장벽을 낮추는 소셜 로그인 기반의 간편한 사용자 흐름 제공                                              |
| Character        | <img src="https://img.shields.io/badge/PixiJS-E91E63?style=for-the-badge"> <img src="https://img.shields.io/badge/Live2D_Cubism-FF6B9D?style=for-the-badge">                                                                                                                                                                                                                                                                | 감정형 마스코트 아바타의 2D 실시간 렌더링·모션 표현                                                        |
| Sound            | <img src="https://img.shields.io/badge/Howler.js-F5A623?style=for-the-badge">                                                                                                                                                                                                                                                                                                                                               | BGM/SFX 재생을 브라우저 호환성 걱정 없이 관리                                                              |
| Animation        | <img src="https://img.shields.io/badge/Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white">                                                                                                                                                                                                                                                                                                                      | 화면 전환·마이크로 인터랙션에 선언적 애니메이션 적용                                                       |
| Deployment       | <img src="https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white">                                                                                                                                                                                                                                                                                                                            | 모바일 우선 학습 앱 특성에 맞춰 설치형 경험, 앱 실행 감각, 기본 오프라인 접근을 제공                       |
| Formatting       | <img src="https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white"> <img src="https://img.shields.io/badge/Prettier-F7B93E?style=for-the-badge&logo=prettier&logoColor=black">                                                                                                                                                                                                           | 코드 스타일을 통일하고 잠재적인 오류를 사전에 방지하여 협업 시 효율성을 높임                               |
| Collaboration    | <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white"> <img src="https://img.shields.io/badge/Notion-000000?style=for-the-badge&logo=notion&logoColor=white"> <img src="https://img.shields.io/badge/Figma-F24E1E?style=for-the-badge&logo=figma&logoColor=white"> <img src="https://img.shields.io/badge/Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white"> | 개발, 문서화, 디자인, 커뮤니케이션을 역할별로 분리하여 협업 효율 향상                                      |

**추가 고려/확장 예정:** 친구 랭킹, 푸시 알림, 성격별 마스코트 대사 시스템 등은 마일스톤에 맞춰 단계적으로 확장합니다.

## 🧩 핵심 사용자 흐름

- 앱 최초 진입
- 스플래시 화면 확인
- Google 소셜 로그인
- 레벨 자가 테스트 진행
- 홈 화면 진입
- 학습 화면에서 스테이지 선택 및 문제 풀이
- 아바타 페이지에서 캐릭터 커스터마이징
- 마이페이지에서 통계, 설정, 로그아웃 관리

### 주요 화면 구성

- **Intro** — 스플래시, Google 로그인, 레벨 자가 테스트
- **Home** — 아바타 상태, 기분 링, 스트릭, 현재 학습 단계 표시
- **Study / Stage Map** — 스테이지 맵, 문제 풀이 세션, 타이머, 점프 러닝 UI
- **Avatar** — 색상, 캐릭터, 닉네임, 성격 커스터마이징
- **My Page** — 프로필 카드, 학습 통계, 설정, 로그아웃

## 🎯 핵심 기능

### 1. 감정형 마스코트 시스템

- 학습 참여도에 따라 마스코트의 감정 상태가 실시간으로 변화
- 홈 화면에서 기분 링과 감정 표현으로 현재 상태 시각화
- 일정 시간 미접속 시 감정 수치가 감소하고, 연속 출석 시 보너스 반영

### 2. 게임형 학습 루프

- 레벨별 스테이지 맵 기반으로 학습 흐름 구성
- 문제 풀이 세션은 **5문제 / 문제당 1분 제한**
- 정답 시 점프, 오답 또는 시간 초과 시 실패 연출을 통해 즉각적인 피드백 제공

### 3. 아바타 커스터마이징

- 몸, 배, 눈 색상 수정 가능
- 2D 프리셋 캐릭터 선택 가능
- 닉네임 및 성격 타입 설정 가능
- 성격에 따라 향후 상호작용 톤 확장 가능성을 고려한 구조

### 4. 학습 기록 및 개인화

- 현재 레벨, 스테이지, XP, 연속 학습 일수 추적
- 누적 문제 풀이 수, 세션 수, 정답률 등 학습 이력 관리
- 설정에서 BGM / SFX 토글 지원 예정

## 🗂️ 데이터 모델 (요약)

MENHERING은 Supabase를 기반으로 다음과 같은 주요 테이블을 중심으로 구성합니다.

| 테이블              | 설명                                            |
| ------------------- | ----------------------------------------------- |
| users               | 유저 기본 정보 (닉네임, 친구 코드 등)           |
| avatars             | 아바타 커스터마이징 데이터                      |
| avatar_status       | 감정 수치 및 마지막 업데이트 시각               |
| user_progress       | 배정 레벨 기준 현재 스테이지, 경험치, 출석 정보 |
| user_level_progress | 레벨별 독립 스테이지 진행도                     |
| sessions            | 학습 세션 기록                                  |
| wrong_answers       | 오답 노트 데이터                                |
| questions           | 문제 데이터                                     |
| rankings            | 랭킹 집계 데이터                                |
| friends             | 친구 요청/수락 관계 데이터 (대기중/수락/거절)   |
| settings            | 사용자별 사운드 설정                            |

## 📱 비기능 요구사항

- **플랫폼** — PWA 기반으로 iOS / Android / Desktop 지원
- **반응형** — 모바일 우선 설계, 360px 이상 대응
- **성능** — Lighthouse Performance 85점 이상 목표
- **인증 보안** — Supabase Auth + Google/Kakao OAuth + RLS 적용
- **오프라인 지원** — 기본 화면 캐시 기반 접근 지원
- **사운드** — Web Audio API 기반 BGM / SFX 관리

## ✅ MVP 범위

### 포함

- 스플래시 화면
- Google / Kakao 로그인
- 레벨 자가 테스트
- 홈 화면
- 학습 화면
- 아바타 커스터마이징
- 마이페이지 (프로필 요약, 학습 통계 차트, 설정, 로그아웃)
- 오답 노트 (기록, 목록/상세, 복습 완료 처리)
- 친구 추가 (닉네임/코드 검색, 요청 보내기, 수락/거절)
- BGM / SFX 설정

### 이후 확장

- 친구 랭킹
- 성격별 마스코트 대사 시스템
- 푸시 알림 기반 학습 리마인더

## 📦 Package Manager

- **npm** 사용
- `package-lock.json` 기반으로 의존성 버전을 관리합니다.

```bash
npm install           # 의존성 설치
npm run dev           # 개발 서버 실행
npm run build         # 프로덕션 빌드
npm run lint          # ESLint 실행
npm run format        # Prettier 포맷팅
npm run format:check  # Prettier 포맷 검사 (CI용)
npm run typecheck     # TypeScript 타입 체크
```

## 📚 문서 가이드

협업 규칙과 코드 스타일 등 세부 규칙은 아래 문서를 참고합니다.

- [세부 규칙 README](./docs/convention/README.md)
- [API 명세 (`docs/api/`)](./docs/api) — 오답노트, 마이페이지 등 구현된 엔드포인트 스펙
- [Live2D 가이드 (`docs/live2d/`)](./docs/live2d) — 마스코트 모델·연동 가이드
- [팀 컨벤션 (`.agents/`)](./.agents) — Git·코드 스타일·구조·Supabase·API 컨벤션 (`CLAUDE.md`에서 참조)

## 📂 프로젝트 구조

```text
📦 menhering-app
┣ 📜 CLAUDE.md              # 프로젝트 전역 지침(팀 컨벤션 링크 모음)
┣ 📜 commitlint.config.mjs
┣ 📜 env.d.ts                # process.env 타입 (새 환경변수 추가 시 함께 갱신)
┣ 📜 eslint.config.mjs
┣ 📜 next.config.ts
┣ 📜 package.json
┣ 📜 postcss.config.mjs
┣ 📜 tsconfig.json
┣ 📂 .agents                 # 팀 컨벤션 (git/code-style/structure/supabase/api)
┣ 📂 .github                 # 이슈·PR 템플릿, CI 워크플로우(ci.yml, security.yml)
┣ 📂 docs
┃ ┣ 📂 api                   # 구현된 API 명세 (예: wrong-note.md, mypage.md)
┃ ┣ 📂 convention             # 세부 규칙 문서
┃ ┗ 📂 live2d                 # 마스코트 모델 스펙·연동 가이드
┣ 📂 public
┃ ┣ 📂 icons
┃ ┣ 📂 images
┃ ┣ 📂 live2d                 # Live2D 모델 에셋
┃ ┣ 📂 mascot
┃ ┗ 📂 sounds
┣ 📂 scripts                 # 에셋 가공 스크립트 (예: desaturate-fur)
┣ 📂 supabase
┃ ┗ 📂 migrations             # DB 스키마·RLS·RPC 마이그레이션 (파일명: 타임스탬프_설명.sql)
┗ 📂 src
  ┣ 📂 app                    # Next.js App Router
  ┃ ┣ 📂 (auth)               # /login (라우트 그룹, URL에 노출 안 됨)
  ┃ ┣ 📂 api                  # Route Handler (avatar-status/friends/health/learning/mypage/wrong-note)
  ┃ ┣ 📂 auth                 # OAuth 콜백 (Google callback, Kakao start/callback)
  ┃ ┣ 📂 avatar / home / learning / level / level-test / mypage
  ┃ ┗ 📂 serwist               # PWA 서비스워커 라우트
  ┣ 📂 components              # 도메인별 UI (avatar/common/home/intro/learning/mypage/quiz/ranking/wrong-note)
  ┣ 📂 constants
  ┣ 📂 hooks                   # 도메인별 커스텀 훅 (auth/avatar/friends/health/learning/mypage/onboarding/wrong-note)
  ┣ 📂 lib
  ┃ ┣ 📂 supabase              # 브라우저/서버 Supabase 클라이언트, 세션 갱신
  ┃ ┣ 📜 api-client.ts         # publicFetch / privateFetch 공통 fetch 래퍼
  ┃ ┣ 📜 api-error.ts          # ApiError, toErrorResult
  ┃ ┣ 📜 api-response.ts       # toSuccessResult (공용 응답 포맷)
  ┃ ┣ 📜 query-keys.ts         # TanStack Query 키 팩토리 (도메인별)
  ┃ ┗ 📂 auth / date / home / live2d / onboarding / wrong-note
  ┣ 📂 mocks                   # 개발/미출시 기능용 목 데이터
  ┣ 📂 schemas                 # Zod 런타임 검증 스키마 (<domain>.schema.ts)
  ┣ 📂 stores                  # Zustand 스토어
  ┣ 📂 tests                   # 테스트 설정
  ┣ 📂 types                   # 전역/도메인 타입 정의
  ┗ 📜 proxy.ts                # 라우트 보호 (Next.js 16, 구 middleware.ts)
```

- `app` — Next.js App Router 기반 라우팅. `app/api`는 Route Handler
- `components/common` — 공통 UI 컴포넌트, 그 외는 도메인별 하위 폴더
- `hooks/<domain>` — TanStack Query 기반 커스텀 훅 (`use-*.ts`)
- `lib/supabase` — Supabase 클라이언트(브라우저/서버) 및 세션 갱신
- `lib/api-client.ts`, `lib/query-keys.ts` — API 요청·쿼리 키의 단일 소스
- `schemas` — API 요청/응답 Zod 스키마, `z.infer`로 타입 파생(별도 타입 중복 정의 없음)
- `stores` — Zustand 기반 클라이언트 상태 관리
- `constants` — 상수 및 localStorage key 관리
- `types` — 전역/도메인 타입 정의
- `tests` — 테스트 환경 및 설정 파일
- `supabase/migrations` — CLI(`supabase db push`) 기반으로 관리되는 스키마 변경 이력

## 📚 레퍼런스

- [Duolingo](https://ko.duolingo.com/) — 게이미피케이션 학습 경험 레퍼런스
- [싸다보카](https://ssadavoca.com/) — 단어 학습 앱 UX 레퍼런스
- [말해보카](https://epop.ai/ko) — AI 기반 맞춤 난이도·자동 복습 게이미피케이션 영어 학습 레퍼런스
