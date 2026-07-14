# API / 서버 상태 컨벤션

Supabase 데이터를 클라이언트에서 어떻게 가져오고 검증하는지에 대한 컨벤션입니다.
Supabase 클라이언트 자체(환경변수, RLS 등)는 [`supabase-convention/SKILLS.md`](../supabase-convention/SKILLS.md)를 참고하세요.

## 아키텍처 개요

```
Route Handler (app/api/**/route.ts)
  ↓ Zod 스키마로 요청/응답 검증
schemas/<domain>.schema.ts (단일 소스, z.infer로 타입 파생)
  ↓
lib/api-client.ts (publicFetch / privateFetch)
  ↓
hooks/<domain>/use-*.ts (TanStack Query)
  ↓
컴포넌트
```

## 1. TanStack Query Provider

- `src/app/providers.tsx`에 `QueryClientProvider`를 두고, `src/app/layout.tsx`의 `<body>` 하위에서 감쌉니다.
- 기본 옵션(`staleTime`, `retry` 등)은 `providers.tsx` 한 곳에서만 관리합니다.

## 2. 공통 API client — `src/lib/api-client.ts`

`coreFetch` 하나 위에 이름이 다른 함수 두 개를 노출합니다. 로그인 여부에 따라 클라이언트를 통째로 나누지 않고, 아래 두 함수 중 목적에 맞는 것을 호출합니다.

| 함수           | 용도                                          | 401 처리                  | 캐시                |
| -------------- | --------------------------------------------- | ------------------------- | ------------------- |
| `publicFetch`  | 로그인 불필요 (회원가입, 로그인, 헬스체크 등) | 리다이렉트 없음           | 기본값 사용         |
| `privateFetch` | 로그인 필요 (마이페이지, 오답노트, 친구 등)   | 401 시 로그인 페이지 이동 | `cache: 'no-store'` |

```ts
import { useHealthCheck } from '@/hooks/health/use-health-check';
// 사용 예시는 아래 5번 항목 참고
```

- 새로운 인증 분기(예: 캐싱 전략 추가)가 필요해지면 `coreFetch`의 옵션을 확장하고, `publicFetch`/`privateFetch`는 그 옵션을 미리 채워 넘기는 얇은 래퍼로 유지합니다. boolean 플래그를 호출부마다 넘기는 방식은 지양합니다 (실수하기 쉬움).

## 3. Query key factory — `src/lib/query-keys.ts`

- 도메인별로 계층을 나누고, 하위 키는 상위 키를 스프레드해서 구성합니다.

```ts
export const queryKeys = {
  health: {
    all: ['health'] as const,
  },
  wrongAnswers: {
    all: ['wrong-answers'] as const,
    list: (cursor?: string) => [...queryKeys.wrongAnswers.all, 'list', cursor] as const,
  },
};
```

- 컴포넌트/훅에서 쿼리 키를 직접 배열로 작성하지 않고 반드시 `queryKeys`를 통해 가져옵니다.

## 4. Zod 스키마 — `src/schemas/`

- 파일명: `<domain>.schema.ts` (예: `health.schema.ts`, `wrong-answers.schema.ts`)
- 요청/응답 타입을 `types/`에 별도로 정의하지 않고, 스키마에서 `z.infer`로 파생시킵니다.
- 이 스키마는 Route Handler(응답 검증)와 `react-hook-form`의 `zodResolver`(폼 검증) 양쪽에서 import되는 단일 소스입니다.

```ts
// src/schemas/health.schema.ts
import { z } from 'zod';

export const HealthSchema = z.object({
  status: z.literal('ok'),
  timestamp: z.iso.datetime(),
});

export type Health = z.infer<typeof HealthSchema>;
```

## 5. 공용 응답 포맷 — `src/schemas/api-response.schema.ts`

성공/실패 응답 모두 `{ statusCode, message, data }` 한 가지 형태로 통일합니다. 클라이언트는 항상 같은 모양을 파싱하면 되고, 성공/실패 구분은 HTTP status(및 `res.ok`)로 합니다.

| 상황 | 스키마                          | `data`                              |
| ---- | ------------------------------- | ----------------------------------- |
| 성공 | `ApiResponseSchema(dataSchema)` | 도메인 스키마로 검증된 실제 응답 값 |
| 실패 | `ErrorResponseSchema`           | 추가 정보 없으면 `null`             |

`lib/api-error.ts`의 `ApiError`/`toErrorResult`, `lib/api-response.ts`의 `toSuccessResult`가 각각 Route Handler와 `api-client.ts` 양쪽에서 쓰이는 단일 소스입니다.

```ts
// Route Handler
import { NextResponse } from 'next/server';

import { ApiError, toErrorResult } from '@/lib/api-error';
import { toSuccessResult } from '@/lib/api-response';
import { HealthSchema } from '@/schemas/health.schema';

export async function GET() {
  try {
    if (!found) throw new ApiError(404, '리소스를 찾을 수 없습니다');

    const { body, status } = toSuccessResult(HealthSchema, {
      status: 'ok',
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(body, { status });
  } catch (error) {
    const { body, status } = toErrorResult(error);

    return NextResponse.json(body, { status });
  }
}
```

- `coreFetch`는 성공 시 `ApiResponseSchema(schema).parse(...)`로 검증한 뒤 `data`만 꺼내 반환하고, 실패(`!res.ok`) 시 `ErrorResponseSchema`로 검증한 뒤 `ApiError`를 던집니다. 훅/컴포넌트는 감싸는 형태를 몰라도 되고(`publicFetch`/`privateFetch`가 그대로 도메인 타입을 반환), 에러만 `error instanceof ApiError`로 좁혀 `statusCode`/`message`/`data`에 접근합니다.

## 6. Route Handler + 훅 작성 패턴

`/health`가 최소 구성 예시입니다.

```ts
// src/app/api/health/route.ts
import { NextResponse } from 'next/server';

import { toSuccessResult } from '@/lib/api-response';
import { HealthSchema } from '@/schemas/health.schema';

export async function GET() {
  const { body, status } = toSuccessResult(HealthSchema, {
    status: 'ok',
    timestamp: new Date().toISOString(),
  });

  return NextResponse.json(body, { status });
}
```

```ts
// src/hooks/health/use-health-check.ts
import { useQuery } from '@tanstack/react-query';

import { publicFetch } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import { HealthSchema } from '@/schemas/health.schema';

export function useHealthCheck() {
  return useQuery({
    queryKey: queryKeys.health.all,
    queryFn: () => publicFetch('/api/health', HealthSchema),
  });
}
```

## 7. 새 엔드포인트 추가 체크리스트

1. `schemas/<domain>.schema.ts`에 요청/응답 Zod 스키마 작성
2. `app/api/<domain>/route.ts`에 Route Handler 작성, `toSuccessResult`/`toErrorResult`로 공용 응답 포맷에 맞춰 반환
3. `lib/query-keys.ts`에 해당 도메인 키 추가
4. `hooks/<domain>/use-*.ts`에서 `publicFetch`/`privateFetch` + `useQuery`(또는 `useMutation`)로 훅 작성
5. 로그인 필요 여부에 따라 `publicFetch`/`privateFetch` 중 올바른 것을 선택했는지 확인
