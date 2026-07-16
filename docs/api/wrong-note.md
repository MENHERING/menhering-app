# 오답노트 API 명세

## 목록

| 카테고리  | HTTP Method | API                | Endpoint               |
| --------- | ----------- | ------------------ | ---------------------- |
| wrongnote | GET         | 오답노트 목록 조회 | `/api/wrong-note`      |
| wrongnote | POST        | 오답 기록 생성     | `/api/wrong-note`      |
| wrongnote | GET         | 오답노트 단건 조회 | `/api/wrong-note/{id}` |
| wrongnote | PATCH       | 복습 완료 처리     | `/api/wrong-note/{id}` |

인증: 전체 로그인 필요 (`privateFetch` 사용, `proxy.ts` 보호 대상 — `PUBLIC_PATHS`/`PUBLIC_PREFIXES`에 추가하지 않음)

응답 형식: 모든 엔드포인트는 공용 응답 포맷(`{ statusCode, message, data }`)으로 감싸 반환한다. 아래 예시의 JSON은 이 포맷 기준으로 작성했다.

로그인하지 않은 상태로 접근하면 모든 엔드포인트가 아래와 동일한 401을 반환한다.

```json
{ "statusCode": 401, "message": "로그인이 필요합니다.", "data": null }
```

---

## GET `/api/wrong-note`

### 개요

로그인한 사용자의 오답노트 목록을 최신순으로 커서 기반 페이지네이션으로 반환한다. 목록 화면의 "더보기" 버튼을 누를 때마다 이전 응답의 `nextCursor`를 넘겨 다음 묶음을 이어받는다. 과목/복습 상태 필터(`activeFilter`)는 서버 필터링 없이 프론트엔드에서 이미 받은 목록을 걸러서 처리한다.

---

### 요청 (Request)

**Method**: `GET`

**Endpoint**: `/api/wrong-note`

### Query Parameters

| 파라미터 | 타입   | 필수 여부 | 설명                                                    |
| -------- | ------ | --------- | ------------------------------------------------------- |
| cursor   | string | ❌ 선택   | 이전 응답의 `nextCursor` 값. 생략 시 최신 항목부터 시작 |
| limit    | number | ❌ 선택   | 한 번에 가져올 개수. 생략 시 기본값 10                  |

### 요청 예시

```
GET /api/wrong-note                                       → 첫 페이지 (기본 10개)
GET /api/wrong-note?limit=20                              → 첫 페이지 20개
GET /api/wrong-note?cursor=2026-07-11T09:00:00.134983+00:00 → "더보기" 클릭 시 다음 페이지
```

---

### 응답 (Response)

### 성공 — 200 OK

```json
{
  "statusCode": 200,
  "message": "OK",
  "data": {
    "items": [
      {
        "id": "b3f1a6b0-1c2d-4e3f-9a1b-000000000001",
        "level": "중급",
        "stage": 3,
        "label": "비동기",
        "question": "Q. Promise.all과 Promise.allSettled의 차이는?",
        "options": [
          { "number": 1, "text": "...", "state": "my_wrong" },
          { "number": 2, "text": "...", "state": "neutral" },
          { "number": 3, "text": "...", "state": "correct" },
          { "number": 4, "text": "...", "state": "neutral" }
        ],
        "reviewStatus": "unreviewed",
        "createdAt": "2026-07-11T09:00:00.134983+00:00",
        "explanation": "Promise.allSettled는 개별 실패 여부와 무관하게 모든 결과를 기다려요."
      }
    ],
    "nextCursor": "2026-07-11T09:00:00.134983+00:00",
    "stats": { "total": 12, "unreviewed": 8, "reviewed": 4 }
  }
}
```

마지막 페이지라 더 가져올 항목이 없으면 `nextCursor`는 `null`. 데이터가 아예 없으면 `items: []`(404 아님).

`stats`는 현재 페이지의 `items`가 아니라 로그인한 사용자의 전체 오답 기록 기준으로 서버가 집계해 내려준다(`COUNT` 쿼리). 페이지네이션 중간에도 "전체 오답"/"미복습"/"복습 완료" 숫자가 항상 정확하도록 하기 위함 — `items.length`로 클라이언트에서 계산하면 아직 안 불러온 페이지만큼 값이 줄어 보인다.

`level`/`stage`/`label`은 `questions` 테이블 컬럼명과 그대로 대응(난이도/회차/주제 라벨). `subject`/`topic` 필드는 DB에 존재하지 않아 사용하지 않는다.

`options[].number`/`state`는 서버가 `questions.option_1..4` 텍스트와 `questions.answer`를 비교해 계산해 내려준다(`correct`/`my_wrong`/`neutral`). `daysAgo`("3일 전")는 API가 내려주지 않으며, `createdAt`(ISO datetime, `+00:00` 오프셋 포함)만 반환하고 상대 시간 변환은 프론트엔드에서 처리한다.

### 실패 — 500 Internal Server Error

```json
{ "statusCode": 500, "message": "오답노트 목록을 불러오지 못했습니다.", "data": null }
```

---

## POST `/api/wrong-note`

### 개요

문제를 틀렸을 때 오답 기록을 생성한다. 같은 문제를 다시 틀리면 새로 insert하지 않고 기존 행을 upsert(`user_id, question_id` 유니크 제약 기준)해 `selectedAnswer`/`createdAt`을 갱신하고 `reviewStatus`를 `unreviewed`로 되돌린다. `reviewStatus`는 서버가 항상 `unreviewed`로 설정하고 `reviewedAt`은 `null`로 초기화한다.

`correctAnswer`는 클라이언트가 보내지 않는다. 서버가 `questionId`로 `questions` 테이블을 조회해 `option_1..4` 텍스트와 `answer` 텍스트를 비교, 일치하는 보기의 1-based 번호를 정답으로 직접 판정한다(버튼식 UI라 오타/공백 이슈가 없어 텍스트 비교로 충분).

---

### 요청 (Request)

**Method**: `POST`

**Endpoint**: `/api/wrong-note`

### Body

| 필드           | 타입   | 필수 여부 | 설명                                     |
| -------------- | ------ | --------- | ---------------------------------------- |
| questionId     | uuid   | ✅ 필수   | 틀린 문제 id                             |
| sessionId      | uuid   | ❌ 선택   | 문제를 푼 세션(회차) id                  |
| selectedAnswer | number | ✅ 필수   | 사용자가 선택한 보기 번호 (1~4, 1-based) |

### 요청 예시

```json
{
  "questionId": "d1e2f3a4-0000-0000-0000-000000000010",
  "sessionId": "c9b8a7d6-0000-0000-0000-000000000099",
  "selectedAnswer": 1
}
```

---

### 응답 (Response)

### 성공 — 201 Created

```json
{
  "statusCode": 201,
  "message": "Created",
  "data": {
    "id": "b3f1a6b0-1c2d-4e3f-9a1b-000000000001",
    "questionId": "d1e2f3a4-0000-0000-0000-000000000010",
    "sessionId": "c9b8a7d6-0000-0000-0000-000000000099",
    "selectedAnswer": 1,
    "correctAnswer": 3,
    "reviewStatus": "unreviewed",
    "createdAt": "2026-07-14T09:00:00.134983+00:00",
    "reviewedAt": null
  }
}
```

### 실패 — 400 Bad Request

요청 형식이 스키마와 맞지 않는 경우:

```json
{ "statusCode": 400, "message": "요청 형식이 올바르지 않습니다.", "data": null }
```

`selectedAnswer`가 실제 정답 번호와 같은 경우 (정답을 오답으로 기록할 수 없음):

```json
{ "statusCode": 400, "message": "정답을 오답으로 기록할 수 없습니다.", "data": null }
```

### 실패 — 404 Not Found

```json
{ "statusCode": 404, "message": "존재하지 않는 문제입니다.", "data": null }
```

---

## GET `/api/wrong-note/{id}`

### 개요

오답노트 상세("다시 풀기") 화면에서 단건 조회한다. 응답 형태는 목록의 `items[]` 원소 하나와 동일하다.

---

### 요청 (Request)

**Method**: `GET`

**Endpoint**: `/api/wrong-note/{id}`

### Path Parameters

| 파라미터 | 타입 | 필수 여부 | 설명         |
| -------- | ---- | --------- | ------------ |
| id       | uuid | ✅ 필수   | 오답 기록 id |

### 요청 예시

```
GET /api/wrong-note/b3f1a6b0-1c2d-4e3f-9a1b-000000000001
```

---

### 응답 (Response)

### 성공 — 200 OK

```json
{
  "statusCode": 200,
  "message": "OK",
  "data": {
    "id": "b3f1a6b0-1c2d-4e3f-9a1b-000000000001",
    "level": "중급",
    "stage": 3,
    "label": "비동기",
    "question": "Q. Promise.all과 Promise.allSettled의 차이는?",
    "options": [
      { "number": 1, "text": "...", "state": "my_wrong" },
      { "number": 2, "text": "...", "state": "neutral" },
      { "number": 3, "text": "...", "state": "correct" },
      { "number": 4, "text": "...", "state": "neutral" }
    ],
    "reviewStatus": "unreviewed",
    "createdAt": "2026-07-11T09:00:00.134983+00:00",
    "explanation": "Promise.allSettled는 개별 실패 여부와 무관하게 모든 결과를 기다려요."
  }
}
```

### 실패 — 400 Bad Request

```json
{ "statusCode": 400, "message": "올바르지 않은 오답 기록 id입니다.", "data": null }
```

### 실패 — 404 Not Found

본인 소유가 아니거나 존재하지 않는 id인 경우:

```json
{ "statusCode": 404, "message": "존재하지 않는 오답 기록입니다.", "data": null }
```

---

## PATCH `/api/wrong-note/{id}`

### 개요

오답 항목을 복습 완료 처리한다. 항상 `reviewStatus`를 `reviewed`로 바꾸고 `reviewedAt`을 현재 시각으로 채우는 단방향 처리이며(복습 완료 → 미복습으로 되돌리는 동작 없음), 별도 Body는 없다.

---

### 요청 (Request)

**Method**: `PATCH`

**Endpoint**: `/api/wrong-note/{id}`

### Path Parameters

| 파라미터 | 타입 | 필수 여부 | 설명         |
| -------- | ---- | --------- | ------------ |
| id       | uuid | ✅ 필수   | 오답 기록 id |

### 요청 예시

```
PATCH /api/wrong-note/b3f1a6b0-1c2d-4e3f-9a1b-000000000001
```

---

### 응답 (Response)

### 성공 — 200 OK

```json
{
  "statusCode": 200,
  "message": "OK",
  "data": {
    "id": "b3f1a6b0-1c2d-4e3f-9a1b-000000000001",
    "questionId": "d1e2f3a4-0000-0000-0000-000000000010",
    "sessionId": "c9b8a7d6-0000-0000-0000-000000000099",
    "selectedAnswer": 1,
    "correctAnswer": 3,
    "reviewStatus": "reviewed",
    "createdAt": "2026-07-11T09:00:00.134983+00:00",
    "reviewedAt": "2026-07-14T09:10:00.134983+00:00"
  }
}
```

### 실패 — 400 Bad Request

```json
{ "statusCode": 400, "message": "올바르지 않은 오답 기록 id입니다.", "data": null }
```

### 실패 — 404 Not Found

본인 소유가 아니거나 존재하지 않는 id인 경우 (row-level에서 `user_id` 일치까지 함께 확인):

```json
{ "statusCode": 404, "message": "존재하지 않는 오답 기록입니다.", "data": null }
```
