# 폴더 구조

```
src/
├── app/              # Next.js App Router
│   └── api/          # API Routes
├── components/       # 컴포넌트
│   └── common/       # 공통 컴포넌트
├── hooks/            # 커스텀 훅 (도메인이 늘어나면 hooks/<domain>/use-*.ts 하위 폴더 사용, 예: hooks/health/)
├── lib/              # 유틸리티
│   └── supabase/     # Supabase 클라이언트
├── constants/        # 상수 관리 (진짜 상수, localStorage key 등)
├── mocks/            # 목 데이터
├── schemas/          # Zod 런타임 검증 스키마
├── stores/           # Zustand 스토어
├── types/            # TypeScript 타입
└── tests/            # 테스트 설정
```

## 디렉토리 역할

| 디렉토리      | 역할                                                                                                                                                                                         |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/`        | Next.js App Router 라우팅. `app/api/`는 API Routes                                                                                                                                           |
| `components/` | UI 컴포넌트. `common/`은 여러 곳에서 재사용되는 공통 컴포넌트                                                                                                                                |
| `hooks/`      | 커스텀 훅 (`use-*.ts`). 도메인이 늘어나면 `hooks/<domain>/` 하위 폴더로 분리 (예: `hooks/health/use-health-check.ts`)                                                                        |
| `lib/`        | 유틸리티 함수. `lib/supabase/`에 Supabase 클라이언트, `lib/api-client.ts`에 공통 fetch 래퍼(`publicFetch`/`privateFetch`) 위치                                                               |
| `constants/`  | 변하지 않는 상수, localStorage key 등                                                                                                                                                        |
| `mocks/`      | 개발/테스트용 목 데이터                                                                                                                                                                      |
| `schemas/`    | Zod 런타임 검증 스키마 (`<domain>.schema.ts`). API 요청/응답, `react-hook-form`의 `zodResolver` 양쪽에서 import되는 단일 소스이며, `z.infer`로 타입을 파생시켜 `types/`에 중복 정의하지 않음 |
| `stores/`     | Zustand 전역 상태 스토어                                                                                                                                                                     |
| `types/`      | 공유 TypeScript 타입 정의                                                                                                                                                                    |
| `tests/`      | 테스트 설정                                                                                                                                                                                  |

**도메인 타입 하위 구조**: `types/<domain>/model.ts`(실제 타입 정의) + `types/<domain>/index.ts`(재export)로 분리하는 패턴을 사용합니다 (예: `types/mypage/`, `types/wrong-note/`). API 응답처럼 Zod 스키마로 검증하는 타입은 `schemas/`에서 `z.infer`로 파생시키고, 이 패턴을 별도로 따르지 않아도 됩니다.

## 경로 별칭

- `@/` → `src/` (예: `@/components/common/button`, `@/stores/auth-store`)
