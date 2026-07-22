import { NextRequest, NextResponse } from 'next/server';

import { ApiError, toErrorResult } from '@/lib/api-error';
import { toSuccessResult } from '@/lib/api-response';
import { sendPush } from '@/lib/push/server';
import { createServiceClient } from '@/lib/supabase/service';
import { PushReminderResultSchema } from '@/schemas/push.schema';

// 매일 KST 09:00(vercel.json cron)에 전체 구독자에게 학습 리마인더를 보낸다.
// Vercel Cron은 GET으로 호출한다(POST 아님) — https://vercel.com/docs/cron-jobs
// 유저 세션이 없는 컨텍스트이므로 service role로 RLS를 우회해 전체 구독을 읽는다.
// /api/push/test와 동일한 발송·정리 패턴이되, 대상이 "본인"이 아니라 "전체 구독"이다.
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      throw new ApiError(401, '인증되지 않은 요청입니다.');
    }

    const supabase = createServiceClient();

    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth');

    if (error) {
      console.error('[push/reminder] 구독 조회 실패:', error);
      throw new ApiError(500, '구독을 불러오지 못했습니다.');
    }

    const payload = {
      title: '멘헤링',
      body: '오늘의 학습, 아직이죠? 지금 시작해봐요!',
      url: '/learning',
    };

    const results = await Promise.all(
      (subscriptions ?? []).map((sub) =>
        sendPush({ endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth }, payload),
      ),
    );

    const expiredEndpoints = (subscriptions ?? [])
      .filter((_, index) => results[index] === 'expired')
      .map((sub) => sub.endpoint);

    if (expiredEndpoints.length > 0) {
      const { error: pruneError } = await supabase
        .from('push_subscriptions')
        .delete()
        .in('endpoint', expiredEndpoints);

      // 삭제가 실패하면 만료 구독이 남으므로 pruned로 보고하지 않고 500으로 처리한다.
      if (pruneError) {
        console.error('[push/reminder] 만료 구독 정리 실패:', pruneError);
        throw new ApiError(500, '만료된 구독 정리에 실패했습니다.');
      }
    }

    const { body, status } = toSuccessResult(PushReminderResultSchema, {
      sent: results.filter((result) => result === 'sent').length,
      pruned: expiredEndpoints.length,
    });

    return NextResponse.json(body, { status });
  } catch (error) {
    if (!(error instanceof ApiError)) console.error('[push/reminder] 처리 실패:', error);

    const { body, status } = toErrorResult(error);

    return NextResponse.json(body, { status });
  }
}
