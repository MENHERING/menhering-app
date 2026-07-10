# Supabase 가이드

> ⚠️ 이 문서의 일부 항목은 표준 기반 **제안값**입니다. 팀 합의 후 확정/수정하세요.

## 환경변수

- 키는 `.env.local`(로컬) / `.env`(배포)에 두며, 절대 커밋하지 않습니다. (`.gitignore`에서 `.env*` 차단)
- 자리표시자 견본은 [`.env.local.example`](../../.env.local.example)에 유지합니다. (유일하게 커밋되는 env 파일)
- 새 환경변수를 추가하면 저장소 루트의 [`env.d.ts`](../../env.d.ts)에도 `NodeJS.ProcessEnv` 타입을 함께 추가합니다. `process.env.*`가 `string`으로 좁혀져 `!` 타입 단언 없이 사용할 수 있습니다.

| 변수                                   | 노출 범위     | 용도                                     |
| -------------------------------------- | ------------- | ---------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | 클라이언트 OK | 프로젝트 URL                             |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | 클라이언트 OK | publishable(public) 키                   |
| `SUPABASE_SERVICE_ROLE_KEY`            | **서버 전용** | RLS 우회 권한. 클라이언트 노출 절대 금지 |

## 클라이언트 위치

- Supabase 클라이언트는 `src/lib/supabase/`에 정의합니다.
- 브라우저용/서버용 클라이언트를 분리합니다. (`@supabase/ssr` 사용)
  - `src/lib/supabase/client.ts` (브라우저), `src/lib/supabase/server.ts` (서버 컴포넌트/Route Handler) — 기본 보일러플레이트 제공됨

## RLS / 마이그레이션 (기본 원칙)

- 모든 테이블에 **RLS(Row Level Security)를 활성화**하고, 정책 없이 공개하지 않습니다.
- `SUPABASE_SERVICE_ROLE_KEY`는 서버 환경에서만 사용합니다.
- 스키마 변경은 Supabase CLI 마이그레이션(`supabase/migrations/`)으로 관리하고, 대시보드 수동 변경은 지양합니다.
- 로컬 개발 시 `supabase start`로 로컬 스택을 띄워 검증 후 원격에 반영합니다.
