-- 코인 구매 RPC 권한 하드닝(증분). 20260713141850_avatar_inventory_purchase.sql 적용 후 실행한다.
-- 이유: Postgres는 CREATE FUNCTION 시 EXECUTE를 PUBLIC에 기본 부여한다. authenticated에 grant를 줘도
-- PUBLIC(anon 포함)이 남아 anon이 RPC를 호출할 수 있다(함수가 auth.uid()로 자기방어는 하지만,
-- PostgREST가 RPC를 anon에 노출하는 구조라 least-privilege로 PUBLIC을 회수한다).

-- 메인 RPC: PUBLIC 회수 후 authenticated만 유지(authenticated grant는 원본 파일에 이미 있음).
revoke execute on function public.buy_avatar_item(text, text) from public;
revoke execute on function public.get_my_avatar_items() from public;

-- 헬퍼: SECURITY DEFINER 함수 내부에서 owner 권한으로 호출되므로 외부 EXECUTE가 전혀 필요 없다.
-- PUBLIC 회수만 하고 어떤 롤에도 grant하지 않는다(내부 호출은 영향 없음).
revoke execute on function public._avatar_item_cost(text) from public;
revoke execute on function public._avatar_item_valid(text, text) from public;
revoke execute on function public._avatar_item_is_default(text, text) from public;
