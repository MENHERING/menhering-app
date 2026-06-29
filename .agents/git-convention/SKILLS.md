# Git Convention

## Git Flow

```
main ← develop ← feat
```

| 브랜치    | 역할                                   |
| --------- | -------------------------------------- |
| `main`    | 배포 브랜치                            |
| `develop` | 개발 브랜치 (feature 브랜치가 merge됨) |
| `feat` 등 | 페이지 / 기능별 작업 브랜치            |

## Commit Style

| 커밋 유형  | 의미                                                         |
| ---------- | ------------------------------------------------------------ |
| `feat`     | 신규 기능 개발 및 업데이트                                   |
| `fix`      | 일반적인 버그 수정                                           |
| `hotfix`   | 운영 환경에서 발생한 긴급 장애 대응                          |
| `style`    | 코드 formatting, 세미콜론 누락 등 코드 자체 변경이 없는 경우 |
| `refactor` | 기능 변화 없는 코드 구조 및 로직 개선                        |
| `chore`    | 빌드 설정, 의존성 관리, 패키지 설치 등                       |
| `docs`     | 프로젝트 문서(README, API 명세 등) 작성 및 수정              |
| `init`     | 프로젝트 초기 세팅                                           |

## Commit Convention

- 형식: `커밋유형: 상세설명 (#이슈번호)`

예시:

```
init: 프로젝트 초기 세팅 (#1)
feat: 메인페이지 개발 (#2)
fix: 로그인 토큰 갱신 오류 수정 (#15)
```

## Branch Convention

- 형식: `커밋유형/#이슈번호/설명`

예시:

```
init/#1/init
feat/#2/main-page
fix/#15/token-refresh
```

## Flow

1. `이슈 생성` (이슈 템플릿 사용: 기능 제안 / 버그 리포트 / 리팩토링 제안 / 문서 작업)
2. 이슈 번호에 맞게 `develop` 브랜치에서 새로운 브랜치 생성
3. 작업 완료 후 커밋 컨벤션에 맞게 커밋
4. Pull Request 생성 (PR 템플릿 사용)
5. `develop` 브랜치로 병합 (**squash 머지**)

## Code Review

- 기본 베이스는 [**CodeRabbit**](https://www.coderabbit.ai/) 자동 리뷰
- 머지 조건: **팀원 1명 승인** + 코드리뷰 완료
- 컨벤션 / 아키텍처 리뷰: 팀원 누구나

## Templates

- PR 템플릿: [`.github/pull_request_template.md`](../../.github/pull_request_template.md)
- 이슈 템플릿: [`.github/ISSUE_TEMPLATE/`](../../.github/ISSUE_TEMPLATE)
