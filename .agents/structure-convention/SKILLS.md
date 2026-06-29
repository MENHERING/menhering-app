# 폴더 구조

```
src/
├── app/              # Next.js App Router
│   └── api/          # API Routes
├── components/       # 컴포넌트
│   └── common/       # 공통 컴포넌트
├── hooks/            # 커스텀 훅
├── lib/              # 유틸리티
│   └── supabase/     # Supabase 클라이언트
├── constants/        # 상수 관리 (진짜 상수, localStorage key 등)
├── mocks/            # 목 데이터
├── stores/           # Zustand 스토어
├── types/            # TypeScript 타입
└── tests/            # 테스트 설정
```

## 디렉토리 역할

| 디렉토리      | 역할                                                          |
| ------------- | ------------------------------------------------------------- |
| `app/`        | Next.js App Router 라우팅. `app/api/`는 API Routes            |
| `components/` | UI 컴포넌트. `common/`은 여러 곳에서 재사용되는 공통 컴포넌트 |
| `hooks/`      | 커스텀 훅 (`use-*.ts`)                                        |
| `lib/`        | 유틸리티 함수. `lib/supabase/`에 Supabase 클라이언트 위치     |
| `constants/`  | 변하지 않는 상수, localStorage key 등                         |
| `mocks/`      | 개발/테스트용 목 데이터                                       |
| `stores/`     | Zustand 전역 상태 스토어                                      |
| `types/`      | 공유 TypeScript 타입 정의                                     |
| `tests/`      | 테스트 설정                                                   |

## 경로 별칭

- `@/` → `src/` (예: `@/components/common/button`, `@/stores/auth-store`)
