import { NextResponse } from 'next/server';

import { ApiError, toErrorResult } from '@/lib/api-error';
import { toSuccessResult } from '@/lib/api-response';
import { createClient } from '@/lib/supabase/server';
import {
  PushSubscribeResultSchema,
  PushSubscriptionInputSchema,
  PushUnsubscribeInputSchema,
} from '@/schemas/push.schema';

// 브라우저 푸시 구독을 저장한다. 같은 유저가 같은 브라우저(endpoint)로 재구독하면 키를 갱신(upsert)한다.
// 다른 계정으로의 소유권 이전은 RLS UPDATE 정책이 막는다 - endpoint만 알면 남의 구독 행을 자기 것으로
// 바꿔치기할 수 있기 때문이다. 그래서 공유 브라우저에서 계정을 바꿔 재구독하면 이 저장은 실패한다(500).
// 이전이 필요해지면 service_role로 기존 행을 정리하는 별도 서버 흐름으로 분리한다.
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new ApiError(401, '로그인이 필요합니다.');

    const parsed = PushSubscriptionInputSchema.safeParse(await request.json().catch(() => null));

    if (!parsed.success) throw new ApiError(400, '구독 정보 형식이 올바르지 않습니다.');

    const { endpoint, keys } = parsed.data;

    const { error } = await supabase
      .from('push_subscriptions')
      .upsert(
        { user_id: user.id, endpoint, p256dh: keys.p256dh, auth: keys.auth },
        { onConflict: 'endpoint' },
      );

    if (error) {
      console.error('[push/subscribe] 저장 실패:', error);
      throw new ApiError(500, '구독 저장에 실패했습니다.');
    }

    const { body, status } = toSuccessResult(PushSubscribeResultSchema, { subscribed: true });

    return NextResponse.json(body, { status });
  } catch (error) {
    const { body, status } = toErrorResult(error);

    return NextResponse.json(body, { status });
  }
}

// 구독 해제 — endpoint로 본인 구독 행을 지운다(RLS가 본인 것으로 스코프).
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new ApiError(401, '로그인이 필요합니다.');

    const parsed = PushUnsubscribeInputSchema.safeParse(await request.json().catch(() => null));

    if (!parsed.success) throw new ApiError(400, 'endpoint가 필요합니다.');

    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('endpoint', parsed.data.endpoint);

    if (error) {
      console.error('[push/subscribe] 해제 실패:', error);
      throw new ApiError(500, '구독 해제에 실패했습니다.');
    }

    const { body, status } = toSuccessResult(PushSubscribeResultSchema, { subscribed: false });

    return NextResponse.json(body, { status });
  } catch (error) {
    const { body, status } = toErrorResult(error);

    return NextResponse.json(body, { status });
  }
}
