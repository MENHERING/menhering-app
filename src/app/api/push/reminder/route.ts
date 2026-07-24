import { NextRequest, NextResponse } from 'next/server';

import { DEFAULT_MOOD_VALUE } from '@/constants/avatar';
import { moodFromValue } from '@/constants/mood';
import { REMINDER_DIALOGUE } from '@/constants/reminder-dialogue';
import { ApiError, toErrorResult } from '@/lib/api-error';
import { toSuccessResult } from '@/lib/api-response';
import { sendPush } from '@/lib/push/server';
import { createServiceClient } from '@/lib/supabase/service';
import { PushReminderResultSchema } from '@/schemas/push.schema';

// _mood_decay_per_day()(supabase/migrations/20260714121731_avatar_mood_decay.sql)와 같은 값.
// get_avatar_status RPC는 auth.uid() 기반이라 세션 없는 service role 컨텍스트에선 못 쓰므로,
// 감쇠를 여기서 같은 공식으로 재계산한다(DB에 쓰지는 않는다 — 문구 선택용 근사치면 충분).
const MOOD_DECAY_PER_DAY = 25;

function decayedMoodValue(moodValue: number, updatedAt: string): number {
  const elapsedDays = (Date.now() - new Date(updatedAt).getTime()) / 86_400_000;
  const decay = Math.floor(elapsedDays * MOOD_DECAY_PER_DAY);

  return Math.max(0, moodValue - decay);
}

// cron 응답이라 하이드레이션 걱정 없이 매 호출마다 자유롭게 무작위 선택한다.
function pickDialogue(lines: readonly string[]): string {
  return lines[Math.floor(Math.random() * lines.length)];
}

// 매일 KST 09:00(vercel.json cron)에 전체 구독자에게 학습 리마인더를 보낸다.
// Vercel Cron은 GET으로 호출한다(POST 아님) — https://vercel.com/docs/cron-jobs
// 유저 세션이 없는 컨텍스트이므로 service role로 RLS를 우회해 전체 구독을 읽는다.
// 발송 후 만료(404/410) 구독을 정리하는 패턴이되, 대상이 "본인"이 아니라 "전체 구독"이다.
export async function GET(request: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = request.headers.get('authorization');

    // cronSecret이 배포 환경에 없으면 authHeader와 무관하게 항상 거부한다 — 없으면
    // `Bearer undefined`가 그대로 비교돼 그 문자열을 보낸 요청이 인증을 통과해버린다.
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      throw new ApiError(401, '인증되지 않은 요청입니다.');
    }

    const supabase = createServiceClient();

    // PostgREST 기본 응답 상한(1000행)을 넘는 규모가 되면 페이지네이션(.range())이 필요하다.
    // 지금 서비스 규모에서는 아직 아니라고 판단해 미루지만, 구독자가 크게 늘면 여기부터 확인할 것.
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth, user_id');

    if (error) {
      console.error('[push/reminder] 구독 조회 실패:', error);
      throw new ApiError(500, '구독을 불러오지 못했습니다.');
    }

    // 구독자별 현재 무드로 알림 문구를 다르게 고른다. push_subscriptions와 avatars는 둘 다
    // auth.users만 참조할 뿐 서로 FK가 없어 PostgREST embed로 한 번에 못 묶으므로 따로 조회해 합친다.
    const userIds = [...new Set((subscriptions ?? []).map((sub) => sub.user_id))];
    const moodValueByUserId = new Map<string, number>();

    if (userIds.length > 0) {
      const { data: avatarRows, error: avatarError } = await supabase
        .from('avatars')
        .select('user_id, avatar_status(mood_value, updated_at)')
        .in('user_id', userIds);

      if (avatarError) {
        // 무드 조회 실패는 발송 자체를 막을 이유가 없다 — 아래에서 기본값(DEFAULT_MOOD_VALUE)으로 폴백.
        console.error('[push/reminder] 무드 조회 실패:', avatarError);
      } else {
        for (const row of avatarRows ?? []) {
          const status = Array.isArray(row.avatar_status)
            ? row.avatar_status[0]
            : row.avatar_status;

          if (status) {
            moodValueByUserId.set(
              row.user_id,
              decayedMoodValue(status.mood_value, status.updated_at),
            );
          }
        }
      }
    }

    // allSettled: 한 구독의 발송 실패(예: 잘못된 키로 인한 4xx)가 나머지 구독자의 발송까지
    // 막아선 안 된다 — Promise.all이면 하나만 reject해도 전체가 reject돼 그날 리마인더가
    // 아무에게도 안 나간다. 실패는 관측만 하고(로그), 만료(404/410) 판정된 것만 정리한다.
    const results = await Promise.allSettled(
      (subscriptions ?? []).map((sub) => {
        const mood = moodFromValue(moodValueByUserId.get(sub.user_id) ?? DEFAULT_MOOD_VALUE);
        const payload = {
          title: '멘헤링',
          body: pickDialogue(REMINDER_DIALOGUE[mood]),
          url: '/learning',
        };

        return sendPush({ endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth }, payload);
      }),
    );

    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(
          `[push/reminder] 발송 실패 (endpoint: ${subscriptions?.[index]?.endpoint}):`,
          result.reason,
        );
      }
    });

    const expiredEndpoints = (subscriptions ?? [])
      .filter(
        (_, index) => results[index].status === 'fulfilled' && results[index].value === 'expired',
      )
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
      sent: results.filter((result) => result.status === 'fulfilled' && result.value === 'sent')
        .length,
      pruned: expiredEndpoints.length,
    });

    return NextResponse.json(body, { status });
  } catch (error) {
    if (!(error instanceof ApiError)) console.error('[push/reminder] 처리 실패:', error);

    const { body, status } = toErrorResult(error);

    return NextResponse.json(body, { status });
  }
}
