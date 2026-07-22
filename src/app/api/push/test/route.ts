import { NextResponse } from 'next/server';

import { ApiError, toErrorResult } from '@/lib/api-error';
import { toSuccessResult } from '@/lib/api-response';
import { sendPush } from '@/lib/push/server';
import { createClient } from '@/lib/supabase/server';
import { PushTestResultSchema } from '@/schemas/push.schema';

// Phase 1 파이프라인 검증용 디버그 엔드포인트 — 본인의 모든 구독에 테스트 푸시를 보낸다.
// 만료(404/410)된 구독은 발송 시점에 감지해 정리한다. Phase 3 스케줄러가 쓸 발송·정리 로직의 축소판.
export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new ApiError(401, '로그인이 필요합니다.');

    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth');

    if (error) {
      console.error('[push/test] 구독 조회 실패:', error);
      throw new ApiError(500, '구독을 불러오지 못했습니다.');
    }

    if (!subscriptions || subscriptions.length === 0) {
      throw new ApiError(404, '저장된 푸시 구독이 없습니다. 먼저 알림을 구독하세요.');
    }

    const payload = {
      title: '멘헤링',
      body: '테스트 알림이야! 잘 도착했어? ㅎㅎ',
      url: '/home',
    };

    const results = await Promise.all(
      subscriptions.map((sub) =>
        sendPush({ endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth }, payload),
      ),
    );

    const expiredEndpoints = subscriptions
      .filter((_, index) => results[index] === 'expired')
      .map((sub) => sub.endpoint);

    if (expiredEndpoints.length > 0) {
      const { error: pruneError } = await supabase
        .from('push_subscriptions')
        .delete()
        .in('endpoint', expiredEndpoints);

      // 삭제가 실패하면 만료 구독이 남으므로 pruned로 보고하지 않고 500으로 처리한다.
      if (pruneError) {
        console.error('[push/test] 만료 구독 정리 실패:', pruneError);
        throw new ApiError(500, '만료된 구독 정리에 실패했습니다.');
      }
    }

    const { body, status } = toSuccessResult(PushTestResultSchema, {
      sent: results.filter((result) => result === 'sent').length,
      pruned: expiredEndpoints.length,
    });

    return NextResponse.json(body, { status });
  } catch (error) {
    const { body, status } = toErrorResult(error);

    return NextResponse.json(body, { status });
  }
}
