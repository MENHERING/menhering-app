# 코드 스타일 컨벤션

네이밍 · 컴포넌트 · TypeScript · 스타일 · import 순서 · 주석 규칙을 한곳에 모은 문서입니다.

---

## 1. 네이밍

### 파일 및 폴더

| 대상          | 규칙           | 예시                             |
| ------------- | -------------- | -------------------------------- |
| 폴더          | kebab-case     | `user-profile/`, `order-list/`   |
| 일반 파일     | kebab-case     | `auth-utils.ts`, `api-client.ts` |
| 컴포넌트 파일 | PascalCase     | `LoginForm.tsx`, `UserCard.tsx`  |
| 훅 파일       | kebab-case     | `use-auth.ts`, `use-products.ts` |
| 테스트 파일   | 원본명.test    | `LoginForm.test.tsx`             |
| 스토리 파일   | 원본명.stories | `Button.stories.tsx`             |

### 코드 내 네이밍

| 대상            | 규칙             | 예시                          |
| --------------- | ---------------- | ----------------------------- |
| 컴포넌트        | PascalCase       | `LoginForm`, `ProductCard`    |
| 함수            | camelCase        | `getUserData`, `handleSubmit` |
| 변수            | camelCase        | `userName`, `productList`     |
| 상수            | UPPER_SNAKE_CASE | `API_URL`, `MAX_COUNT`        |
| 타입/인터페이스 | PascalCase       | `User`, `ProductProps`        |
| Enum            | PascalCase       | `OrderStatus`, `UserRole`     |

### Boolean 네이밍

| 접두어   | 용도      | 예시                          |
| -------- | --------- | ----------------------------- |
| `is`     | 상태      | `isLoading`, `isLoggedIn`     |
| `has`    | 소유      | `hasError`, `hasPermission`   |
| `can`    | 가능 여부 | `canEdit`, `canDelete`        |
| `should` | 필요 여부 | `shouldRender`, `shouldFetch` |

### 이벤트 핸들러

| 접두어   | 용도          | 예시                          |
| -------- | ------------- | ----------------------------- |
| `handle` | 이벤트 핸들러 | `handleClick`, `handleSubmit` |
| `on`     | Props 콜백    | `onClick`, `onSubmit`         |

---

## 2. 컴포넌트

### 파일 구조

```tsx
// 1. imports
import { useState } from 'react';

import { Button } from '@/components/common/button';
import { useAuthStore } from '@/stores/auth-store';

// 2. types
interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  onSelect?: (id: string) => void;
}

// 3. component
export function ProductCard({ id, name, price, onSelect }: ProductCardProps) {
  // hooks
  const [isLoading, setIsLoading] = useState(false);

  // handlers
  const handleClick = () => {
    onSelect?.(id);
  };

  // render
  return (
    <div onClick={handleClick}>
      {name} - {price}원
    </div>
  );
}
```

### 규칙

- ✅ 컴포넌트당 하나의 파일
- ✅ Props 인터페이스는 파일 상단에 정의
- ✅ `export function` 사용 (default export 지양)
- ❌ 인라인 스타일 금지 → Tailwind CSS 사용
- ❌ `any` 타입 사용 금지

**예외 (default export 필수)**: Next.js App Router 예약 파일은 프레임워크 요구사항으로 default export가 강제되며, `eslint.config.mjs`에서도 아래 파일 패턴에 대해 `import/no-default-export` 규칙을 명시적으로 off 처리합니다. 이 경로들은 default export 사용이 컨벤션 위반이 아닙니다.

- `src/app/**/page.tsx`, `layout.tsx`, `error.tsx`, `loading.tsx`, `not-found.tsx`, `template.tsx`, `manifest.ts`(PWA manifest)
- 설정 파일: `next.config.ts`, `postcss.config.mjs`, `tailwind.config.ts`, `eslint.config.mjs`, `commitlint.config.mjs`

> `route.ts`는 default export 대상이 아닙니다. Route Handler는 `GET`/`POST` 등 HTTP 메서드명의 named export를 사용하므로 1번 규칙(`export function` 사용)을 그대로 따릅니다.

---

## 3. TypeScript

### 타입 정의

```tsx
// ✅ interface - 확장 가능한 객체
interface User {
  id: string;
  name: string;
}

// ✅ type - 유니온, 유틸리티 타입
type Status = 'pending' | 'approved' | 'rejected';
type UserWithRole = User & { role: string };
```

### 금지 사항

```tsx
// ❌ any 금지
const data: any = response;

// ✅ unknown 또는 명시적 타입
const data: unknown = response;
const user: User = response as User;
```

- `interface`: 확장 가능한 객체 형태에 사용
- `type`: 유니온 / 유틸리티 타입에 사용
- `any` 사용 금지 → `unknown` 또는 명시적 타입으로 대체
- 타입 단언(`as`)은 최소화: 옵셔널/필수 불일치를 `as`로 덮어쓰지 말고, 실제 사용 패턴에 맞게 원본 타입 정의(옵셔널 여부 등)를 먼저 수정할 것 (`as const`처럼 리터럴 타입을 좁히는 용도는 예외)

---

## 4. 스타일 (Tailwind CSS)

스타일링은 Tailwind CSS로 처리하며, 인라인 스타일은 금지합니다.

```tsx
// ✅ Good
<div className="flex items-center gap-4 p-4 bg-white rounded-lg">

// ❌ Bad - 인라인 스타일
<div style={{ display: 'flex', padding: '16px' }}>
```

---

## 5. Import 순서

ESLint `import/order` 규칙에 의해 자동 정렬됩니다. (`eslint.config.mjs`)

```tsx
// 1. builtin (React가 external 그룹 내 최우선)
import { useState, useEffect } from 'react';

// 2. external (node_modules, 그 외 알파벳순)
import { create } from 'zustand';

// 3. internal (@/ alias)
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth-store';

// 4. parent/sibling
import { formatDate } from '../utils';
import { ProductCard } from './ProductCard';
```

- 순서: `builtin` → `external`(react 최우선) → `internal(@/)` → `parent/sibling`
- 그룹 간 빈 줄 필수 (`newlines-between: 'always'`)
- 그룹 내 알파벳 정렬 (`alphabetize: asc, caseInsensitive`)

---

## 6. 주석

```tsx
// ✅ 복잡한 로직 설명
// 할인율 계산: (원가 - 할인가) / 원가 * 100
const discountRate = ((original - discount) / original) * 100;

// ✅ TODO 주석
// TODO: 에러 핸들링 추가 필요

// ❌ 불필요한 주석
// 유저 이름을 가져온다
const userName = user.name;
```

- 복잡한 로직은 의도/계산식을 주석으로 설명
- 할 일은 `// TODO:` 형식으로 명시
- 코드만 봐도 자명한 내용에 대한 불필요한 주석은 지양
