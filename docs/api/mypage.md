# 마이페이지 API 명세

## 목록

| 카테고리 | HTTP Method | API                  | Endpoint      |
| -------- | ----------- | -------------------- | ------------- |
| mypage   | GET         | 마이페이지 요약 조회 | `/api/mypage` |

인증: 전체 로그인 필요 (`privateFetch` 사용, `proxy.ts` 보호 대상 — `PUBLIC_PATHS`/`PUBLIC_PREFIXES`에 추가하지 않음)

응답 형식: 모든 엔드포인트는 공용 응답 포맷(`{ statusCode, message, data }`)으로 감싸 반환한다. 아래 예시의 JSON은 이 포맷 기준으로 작성했다.

로그인하지 않은 상태로 접근하면 아래와 동일한 401을 반환한다.

```json
{ "statusCode": 401, "message": "로그인이 필요합니다.", "data": null }
```

---

## GET `/api/mypage`

### 개요

로그인한 사용자의 마이페이지 요약(현재 상태 · 스탯 · 학습 통계 차트)을 한 번에 반환한다. `profile`(현재 사용자 상태), `stats`(누적 스탯), `chart`(요일별 학습 통계) 3개 묶음으로 구성된다.

친구/랭킹(`FriendsSection`)과 아바타 이미지(`avatarUrl`)는 이 API가 다루지 않는다 — 친구 기능은 아직 미출시("출시 예정" 배지)라 프론트가 mock을 그대로 쓰고, 아바타 이미지도 자산/렌더링 방식이 팀 논의 중이라 마찬가지로 프론트 mock으로 채운다.

---

### 요청 (Request)

**Method**: `GET`

**Endpoint**: `/api/mypage`

### 요청 예시

```
GET /api/mypage
```

---

### 응답 (Response)

### 성공 — 200 OK

```json
{
  "statusCode": 200,
  "message": "OK",
  "data": {
    "profile": {
      "name": "레드판다",
      "difficulty": "초급",
      "stage": 3,
      "mood": "보통",
      "streakDays": 4,
      "currentXp": 480,
      "targetXp": 500,
      "level": 3
    },
    "stats": {
      "streakDays": 4,
      "completedProblems": 320,
      "totalSessions": 142,
      "totalXp": 1480,
      "accuracyPercent": 87
    },
    "chart": [
      { "label": "월", "value": 30 },
      { "label": "화", "value": 55 },
      { "label": "수", "value": 20 },
      { "label": "목", "value": 90 },
      { "label": "금", "value": 45 },
      { "label": "토", "value": 65 },
      { "label": "일", "value": 15 }
    ]
  }
}
```

### 필드 설명

**profile** — 현재 사용자 상태 (`user_progress` + `avatar_status`)

| 필드       | 타입   | 설명                                                                                          |
| ---------- | ------ | --------------------------------------------------------------------------------------------- |
| name       | string | `users.nickname`                                                                              |
| difficulty | string | `user_progress.level`(실력 단계 문자열, 예: 초급/중급)                                        |
| stage      | number | `user_progress.stage`                                                                         |
| mood       | string | `avatar_status.mood_value`를 5단계로 변환 (행복/보통/우울/지침/화남)                          |
| streakDays | number | `user_progress.streak`                                                                        |
| currentXp  | number | 현재 레벨 안에서의 진행 XP (`xp % 500`)                                                       |
| targetXp   | number | 다음 레벨까지 필요한 XP (고정값 500)                                                          |
| level      | number | `xp / 500`로 계산한 숫자 레벨. **레벨업 공식은 임시(고정 500)이며 팀 논의 후 교체될 수 있음** |

**stats** — 누적 스탯 (`user_progress` + `sessions`)

| 필드              | 타입   | 설명                                                                                       |
| ----------------- | ------ | ------------------------------------------------------------------------------------------ |
| streakDays        | number | profile과 동일 값(같은 연속 학습일을 다른 카드에 표시)                                     |
| completedProblems | number | `sessions.correct_count` 전체 합계 (정답만 카운트 — 오답은 오답노트로 남아 "완료"로 안 침) |
| totalSessions     | number | `sessions` 행 개수 (지금까지 퀴즈를 몇 번 풀었는지)                                        |
| totalXp           | number | `user_progress.xp` 누적 원본값 (레벨 진행용 currentXp와 다름)                              |
| accuracyPercent   | number | 전체 세션의 `correct_count`/`total_count` 합산 퍼센트                                      |

**chart** — 요일별 학습 통계 (`sessions.correct_count` 기준, 최근 90일 구간 합계)

| 필드  | 타입   | 설명                         |
| ----- | ------ | ---------------------------- |
| label | string | 요일 (월~일 순서로 7개 고정) |
| value | number | 정답 문제 수 합계            |

- 프론트는 여기에 `isHighlighted`(오늘 요일 여부)를 클라이언트에서 계산해 붙인다 — API는 순수 값만 반환.
- 이전엔 일별/주별 두 구간을 토글로 보여줬으나 의미가 없다고 판단해 최근 90일 합계 하나로 통일했다.

### 실패 — 500 Internal Server Error

```json
{ "statusCode": 500, "message": "마이페이지 정보를 불러오지 못했습니다.", "data": null }
```

---

## 기타 참고 사항

- `sessions` 조회는 기간 제한 없이 전체를 읽는다(`completedProblems`/`totalSessions`가 누적 총합이라 최근 구간만 보면 안 됨). 유저당 세션이 많아지면 SQL 집계(RPC/view)로 옮겨야 한다 — 코드에 TODO로 남겨둠.
- `mood_value` → `mood` 변환은 아바타 기능과 동일한 5단계 매핑(`constants/mood.ts`의 `moodFromValue`)을 재사용한다.
- `avatar_status` 조회는 raw 테이블이 아니라 `get_avatar_status` RPC를 쓴다 — RPC 안에 있는 lazy 감쇠(시간 경과에 따른 mood_value 자동 하락) 로직을 그대로 타야 하기 때문.
