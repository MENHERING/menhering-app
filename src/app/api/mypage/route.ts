import { NextResponse } from 'next/server';
import { z } from 'zod';

import { STATS_WINDOW_DAYS } from '@/constants/home';
import { moodFromValue } from '@/constants/mood';
import { ApiError, toErrorResult } from '@/lib/api-error';
import { toSuccessResult } from '@/lib/api-response';
import { getKstWeekStart, getKstWeekdayLabel } from '@/lib/date/kst';
import { getLevelInfo } from '@/lib/level';
import { createClient } from '@/lib/supabase/server';
import { ProgressSummarySchema, SessionSummaryListSchema } from '@/schemas/home.schema';
import {
  MyPageSummarySchema,
  type ChartBarData,
  type MyPageSummary,
} from '@/schemas/mypage.schema';

const MS_PER_DAY = 86_400_000;
const DEFAULT_DIFFICULTY = '입문';
const DEFAULT_NAME = '멘헤링이';

const WEEKDAY_OUTPUT_ORDER = ['월', '화', '수', '목', '금', '토', '일'] as const;

const MyPageProgressRowSchema = ProgressSummarySchema.extend({
  level: z.string().nullable(),
});

const UserRowSchema = z.object({
  nickname: z.string(),
});

function toPercent(correct: number, total: number): number {
  if (total <= 0) return 0;

  return Math.round((correct / total) * 100);
}

function buildWeekdayChart(
  rows: { correct_count: number | null; created_at: string }[],
  divisor: number,
): ChartBarData[] {
  const sums = new Map<string, number>();

  for (const row of rows) {
    const label = getKstWeekdayLabel(new Date(row.created_at));

    sums.set(label, (sums.get(label) ?? 0) + (row.correct_count ?? 0));
  }

  return WEEKDAY_OUTPUT_ORDER.map((label) => ({
    label,
    value: Math.round((sums.get(label) ?? 0) / divisor),
  }));
}

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new ApiError(401, '로그인이 필요합니다.');
    }

    const [progressResult, userResult, sessionsResult, moodResult] = await Promise.all([
      supabase
        .from('user_progress')
        .select('stage, xp, streak, level')
        .eq('user_id', user.id)
        .maybeSingle(),
      supabase.from('users').select('nickname').eq('id', user.id).maybeSingle(),
      supabase
        .from('sessions')
        .select('correct_count, total_count, created_at')
        .eq('user_id', user.id),
      supabase.rpc('get_avatar_status').maybeSingle<{ mood_value: number; updated_at: string }>(),
    ]);

    if (progressResult.error)
      console.error('[mypage] user_progress 조회 실패:', progressResult.error);
    if (userResult.error) console.error('[mypage] users 조회 실패:', userResult.error);
    if (sessionsResult.error) console.error('[mypage] sessions 조회 실패:', sessionsResult.error);
    if (moodResult.error) console.error('[mypage] avatar_status 조회 실패:', moodResult.error);

    const progress = MyPageProgressRowSchema.safeParse(progressResult.data);
    const userRow = UserRowSchema.safeParse(userResult.data);
    const sessions = SessionSummaryListSchema.safeParse(sessionsResult.data ?? []);

    if (progressResult.data && !progress.success) {
      console.error('[mypage] user_progress 형식 오류:', progress.error);
    }

    if (userResult.data && !userRow.success) {
      console.error('[mypage] users 형식 오류:', userRow.error);
    }

    if (!sessions.success) {
      console.error('[mypage] sessions 형식 오류:', sessions.error);
    }

    const streak = progress.success ? (progress.data.streak ?? 0) : 0;
    const rawMoodValue = moodResult.data?.mood_value ?? 60;
    const moodValue = Math.round(
      Math.min(100, Math.max(0, Number.isFinite(rawMoodValue) ? rawMoodValue : 60)),
    );

    const { level, currentXp, targetXp } = getLevelInfo(
      progress.success ? (progress.data.xp ?? 0) : 0,
    );

    const allRows = sessions.success ? sessions.data : [];
    const totalSessions = allRows.length;
    const completedProblems = allRows.reduce((sum, row) => sum + (row.correct_count ?? 0), 0);
    const answeredTotal = allRows.reduce((sum, row) => sum + (row.total_count ?? 0), 0);

    const windowStart = Date.now() - STATS_WINDOW_DAYS * MS_PER_DAY;
    const windowRows = allRows.filter((row) => new Date(row.created_at).getTime() >= windowStart);

    // TODO: 주별 차트 추가
    const weekStart = getKstWeekStart();
    const thisWeekRows = allRows.filter((row) => new Date(row.created_at) >= weekStart);

    // TODO: 프로필 이미지 추가
    const summary: MyPageSummary = {
      profile: {
        name: userRow.success ? userRow.data.nickname : DEFAULT_NAME,
        difficulty: progress.success
          ? (progress.data.level ?? DEFAULT_DIFFICULTY)
          : DEFAULT_DIFFICULTY,
        stage: progress.success ? (progress.data.stage ?? 1) : 1,
        mood: moodFromValue(moodValue),
        streakDays: streak,
        currentXp,
        targetXp,
        level,
      },
      stats: {
        streakDays: streak,
        completedProblems,
        totalSessions,
        totalXp: progress.success ? (progress.data.xp ?? 0) : 0,
        accuracyPercent: toPercent(completedProblems, answeredTotal),
      },
      weeklyChart: buildWeekdayChart(windowRows, Math.max(1, Math.round(STATS_WINDOW_DAYS / 7))),
      dailyChart: buildWeekdayChart(thisWeekRows, 1),
    };

    const { body, status } = toSuccessResult(MyPageSummarySchema, summary);

    return NextResponse.json(body, { status });
  } catch (error) {
    if (!(error instanceof ApiError)) {
      console.error('[mypage] 예기치 못한 오류:', error);
    }

    const { body, status } = toErrorResult(error);

    return NextResponse.json(body, { status });
  }
}
