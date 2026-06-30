# MENHERING 세부 규칙 README

MENHERING 프로젝트의 세부 개발 규칙, 협업 방식, 코드 스타일은 이 문서를 기준으로 관리합니다.
메인 README에는 핵심 소개만 유지하고, 상세 규칙은 이 문서에서 확인합니다.

## 🔗 문서 범위

이 문서에는 다음 내용을 포함합니다.

- Git 브랜치 전략
- 커밋 및 PR 규칙
- 코드 네이밍 규칙
- 폴더 구조 기준
- 컴포넌트 작성 규칙
- TypeScript 규칙
- import 순서 및 주석 규칙

## 🌿 Git Convention

### Git Flow

- `main` : 배포 브랜치
- `develop` : 개발 브랜치
- `feat/*` : 기능 개발 브랜치
- `fix/*` : 버그 수정 브랜치
- `init/*` : 초기 설정 브랜치

기본 흐름은 `main ← develop ← feat` 구조를 따릅니다.

### Commit Style

| 커밋 유형 | 의미                                                         |
| --------- | ------------------------------------------------------------ |
| feat      | 신규 기능 개발 및 업데이트                                   |
| fix       | 일반적인 버그 수정                                           |
| hotfix    | 운영 환경에서 발생한 긴급 장애 대응                          |
| style     | 코드 formatting, 세미콜론 누락, 코드 자체의 변경이 없는 경우 |
| refactor  | 기능 변화 없는 코드 구조 및 로직 개선                        |
| chore     | 빌드 설정, 의존성 관리, 패키지 설치 등                       |
| docs      | 프로젝트 문서 작성 및 수정                                   |

### Commit Convention

- 형식: `커밋유형: 상세설명 (#이슈번호)`

예시:

```text
feat: 챗봇 버튼 컴포넌트 구현 (#2)
init: 프로젝트 초기 세팅 (#1)
feat: 메인페이지 개발 (#2)
fix: 로그인 토큰 갱신 오류 수정 (#15)
```

### Branch Convention

```text
init/#1/init
feat/#2/main-page
fix/#15/token-refresh
```

### PR Rule

- 이슈 생성 후 `develop` 브랜치에서 작업 브랜치 생성
- 작업 완료 후 Pull Request 생성
- `develop` 브랜치로 squash merge
- Code Rabbit 기반 리뷰 진행
- 최소 1인 승인 및 코드리뷰 이후 머지

## 📐 Code Convention

### Naming Convention

#### 파일 및 폴더

| 대상          | 규칙           | 예시                             |
| ------------- | -------------- | -------------------------------- |
| 폴더          | kebab-case     | `user-profile/`, `order-list/`   |
| 일반 파일     | kebab-case     | `auth-utils.ts`, `api-client.ts` |
| 컴포넌트 파일 | PascalCase     | `LoginForm.tsx`, `UserCard.tsx`  |
| 훅 파일       | kebab-case     | `use-auth.ts`, `use-products.ts` |
| 테스트 파일   | 원본명.test    | `LoginForm.test.tsx`             |
| 스토리 파일   | 원본명.stories | `Button.stories.tsx`             |

#### 코드 내 네이밍

| 대상            | 규칙             | 예시                          |
| --------------- | ---------------- | ----------------------------- |
| 컴포넌트        | PascalCase       | `LoginForm`, `ProductCard`    |
| 함수            | camelCase        | `getUserData`, `handleSubmit` |
| 변수            | camelCase        | `userName`, `productList`     |
| 상수            | UPPER_SNAKE_CASE | `API_URL`, `MAX_COUNT`        |
| 타입/인터페이스 | PascalCase       | `User`, `ProductProps`        |
| Enum            | PascalCase       | `OrderStatus`, `UserRole`     |

#### Boolean Naming

| 접두어 | 용도      | 예시                          |
| ------ | --------- | ----------------------------- |
| is     | 상태      | `isLoading`, `isLoggedIn`     |
| has    | 소유      | `hasError`, `hasPermission`   |
| can    | 가능 여부 | `canEdit`, `canDelete`        |
| should | 필요 여부 | `shouldRender`, `shouldFetch` |

#### Event Handler Naming

| 접두어 | 용도               | 예시                          |
| ------ | ------------------ | ----------------------------- |
| handle | 이벤트 핸들러 함수 | `handleClick`, `handleSubmit` |
| on     | Props 콜백         | `onClick`, `onSubmit`         |

### 폴더 구조

```text
src/
├── app/              # Next.js App Router
│   └── api/          # API Routes
├── components/       # 컴포넌트
│   └── common/       # 공통 컴포넌트
├── hooks/            # 커스텀 훅
├── lib/              # 유틸리티
│   └── supabase/     # Supabase 클라이언트
├── constants/        # 상수 관리
├── mocks/            # 목 데이터
├── stores/           # Zustand 스토어
├── types/            # TypeScript 타입
└── tests/            # 테스트 설정
```

### 컴포넌트 규칙

```tsx
import { useState } from 'react';

import { Button } from '@/components/common/button';
import { useAuthStore } from '@/stores/auth-store';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  onSelect?: (id: string) => void;
}

export function ProductCard({ id, name, price, onSelect }: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    onSelect?.(id);
  };

  return (
    <div onClick={handleClick}>
      {name} - {price}원
    </div>
  );
}
```

규칙:

- 컴포넌트당 하나의 파일
- Props 인터페이스는 파일 상단에 정의
- `export function` 사용, default export 지양
- 인라인 스타일 금지, Tailwind CSS 사용
- `any` 타입 사용 금지

### 스타일 규칙

```tsx
<div className="flex items-center gap-4 p-4 bg-white rounded-lg">
```

- Tailwind CSS 사용
- 인라인 스타일 사용 금지

### TypeScript 규칙

```ts
interface User {
  id: string;
  name: string;
}

type Status = 'pending' | 'approved' | 'rejected';
type UserWithRole = User & { role: string };
```

- 확장 가능한 객체는 `interface`
- 유니온 및 조합 타입은 `type`
- `any` 금지
- `unknown` 또는 명시적 타입 사용 권장

### Import 순서

1. builtin
2. external
3. internal (`@/` alias)
4. parent / sibling

예시:

```ts
import { useState, useEffect } from 'react';

import { create } from 'zustand';

import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth-store';

import { formatDate } from '../utils';
import { ProductCard } from './ProductCard';
```

### 주석 규칙

좋은 예시:

```ts
// 할인율 계산: (원가 - 할인가) / 원가 * 100
const discountRate = ((original - discount) / original) * 100;

// TODO: 에러 핸들링 추가 필요
```

지양:

```ts
// 유저 이름을 가져온다
const userName = user.name;
```

## ✅ 운영 원칙

- 메인 README는 프로젝트 소개 중심으로 유지
- 세부 규칙 변경 시 이 문서를 우선 수정
- 팀 협업 중 규칙이 변경되면 PR을 통해 문서도 함께 갱신
