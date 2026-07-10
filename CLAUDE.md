# CLAUDE.md

멘헤라 팀(menhering-app) 프로젝트입니다. 모든 작업은 아래 팀 컨벤션을 따릅니다.

## 스택

Next.js (App Router) · TypeScript · Tailwind CSS · Zustand · Supabase · ESLint(import/order)

## 팀 컨벤션 (`.agents/`)

작업 전 반드시 해당 컨벤션을 준수하세요.

- @.agents/git-convention/SKILLS.md — Git Flow, 커밋/브랜치 규칙, PR·리뷰(CodeRabbit)
- @.agents/code-style-convention/SKILLS.md — 네이밍·컴포넌트·TypeScript·스타일·import·주석
- @.agents/structure-convention/SKILLS.md — `src/` 디렉토리 구조·역할
- @.agents/supabase-convention/SKILLS.md — Supabase 환경변수·클라이언트·RLS
- @.agents/api-convention/SKILLS.md — TanStack Query·API client(public/private)·query key·Zod 스키마

## 핵심 규칙 요약

- 커밋: `유형: 상세설명 (#이슈번호)` / 브랜치: `유형/#이슈/설명`
- `develop`에서 브랜치 → PR → **squash 머지** (CodeRabbit 리뷰 + 1명 승인)
- `export function` 사용(default export 지양), `any` 금지, 인라인 스타일 금지
- 비밀키는 `.env.local`(로컬)·`.env`(배포)에만 (커밋 금지), 견본은 `.env.local.example`
