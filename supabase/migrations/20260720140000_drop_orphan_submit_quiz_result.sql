-- 죽은 오버로드 submit_quiz_result(text, jsonb) 제거.
--
-- 배경: 이 시그니처는 어느 마이그레이션에도 정의가 없다(대시보드에서 만들어진 초기 버전으로 추정).
-- 이후 채점 로직은 전부 4-arg 버전 submit_quiz_result(varchar, integer, jsonb, integer)으로
-- 옮겨갔고(20260714140000 → 20260714160000 → 20260714180000 → 20260715120000 → 20260716140000),
-- 2-arg 버전만 정리되지 않은 채 남았다.
--
-- 호출될 수 없음이 확인된 상태다:
--   - 앱은 app/api/learning/quiz/submit/route.ts에서 p_level·p_stage·p_answers·p_duration_sec
--     4개 이름 인자로 호출한다. PostgREST는 넘어온 인자 이름 집합으로 함수를 고르므로,
--     파라미터가 (p_lesson_id, p_answers)인 이 함수는 선택될 수 없다.
--   - 저장소 전체에서 p_lesson_id 참조가 0건이다.
--
-- 남겨두면 위험한 이유: security definer(= RLS 우회)로 도는 데다 PUBLIC EXECUTE까지 열려 있어,
-- 아무도 리뷰하지 않는 옛 보상 로직이 실행 가능한 상태로 방치된다.
--
-- 인자 목록까지 명시해야 4-arg 버전이 아닌 이 함수만 지워진다(오버로드 구분).

drop function if exists public.submit_quiz_result(text, jsonb);
