-- 웹 푸시 구독 저장. 마스코트 감정 알림(Phase 3)이 우울해진 유저에게 푸시를 보내려면
-- 브라우저가 발급한 PushSubscription(endpoint + 암호화 키)을 서버가 보관해야 한다.
--
-- endpoint는 브라우저 구독 1건을 전역에서 유일하게 식별한다(같은 브라우저 재구독 시 동일 or 신규).
-- 그래서 unique(endpoint)로 두고, 재구독은 upsert로 키·소유자를 갱신한다.
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  endpoint text not null unique,
  -- 페이로드 암호화용 공개키(p256dh)와 인증 시크릿(auth). PushSubscription.toJSON().keys 그대로.
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

create index if not exists push_subscriptions_user_id_idx on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;

-- 본인 구독만 조회/삭제. 자동 발송(Phase 3)은 service_role이 RLS를 우회해 전체를 읽는다.
create policy "push_subscriptions_select_own" on public.push_subscriptions
  for select using (auth.uid() = user_id);

create policy "push_subscriptions_insert_self" on public.push_subscriptions
  for insert with check (auth.uid() = user_id);

-- 한 브라우저(endpoint)를 다른 계정으로 재구독하면 소유자를 넘겨받아야 한다. endpoint는 그 브라우저만
-- 가진 값이라, "내 것으로만 바꿀 수 있다"(with check)면 남의 구독을 임의로 뺏을 수 없다.
create policy "push_subscriptions_update_self" on public.push_subscriptions
  for update using (true) with check (auth.uid() = user_id);

create policy "push_subscriptions_delete_own" on public.push_subscriptions
  for delete using (auth.uid() = user_id);
