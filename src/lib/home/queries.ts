import {
  ACCESS_STREAK_MAX_DAYS,
  HOME_GREETING,
  STATS_WINDOW_DAYS,
  XP_FOR_NEXT_LEVEL,
} from '@/constants/home';
import { createClient } from '@/lib/supabase/server';
import {
  ProgressSummarySchema,
  SessionSummaryListSchema,
  type SessionSummary,
} from '@/schemas/home.schema';
import type { HomeSummary } from '@/types/home';

const MS_PER_DAY = 86_400_000;
// 서비스 기준 시간대(KST). 서버는 UTC로 도는데 "오늘"은 한국 날짜 기준이라 경계를 직접 계산한다.
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

const EMPTY_SUMMARY: HomeSummary = {
  greeting: HOME_GREETING,
  accessStreak: 0,
  accessStreakMax: ACCESS_STREAK_MAX_DAYS,
  stage: 1,
  xp: 0,
  xpForNextLevel: XP_FOR_NEXT_LEVEL,
  todayCompleted: 0,
  learnStreak: 0,
  accuracyPercent: 0,
};

// KST 기준 오늘 0시에 해당하는 UTC 시각.
function getKstDayStart(): Date {
  const nowInKst = Date.now() + KST_OFFSET_MS;
  const kstMidnight = Math.floor(nowInKst / MS_PER_DAY) * MS_PER_DAY;

  return new Date(kstMidnight - KST_OFFSET_MS);
}

function toPercent(correct: number, total: number): number {
  if (total <= 0) return 0;

  return Math.round((correct / total) * 100);
}

/**
 * 홈 화면 요약 정보를 조회한다.
 * 스테이지·XP·연속 학습일은 user_progress에서, 오늘 완료 수·정답률은 sessions에서 집계한다.
 * 조회에 실패하면 해당 값만 0으로 떨어지고 홈은 그대로 렌더된다.
 */
export async function getHomeSummary(): Promise<HomeSummary> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return EMPTY_SUMMARY;

  // 전체 세션을 다 읽지 않도록 최근 구간만 집계한다.
  const windowStart = new Date(Date.now() - STATS_WINDOW_DAYS * MS_PER_DAY).toISOString();

  // 서로 독립적인 조회라 병렬 실행한다.
  const [progressResult, sessionsResult] = await Promise.all([
    supabase.from('user_progress').select('stage, xp, streak').eq('user_id', user.id).maybeSingle(),
    supabase
      .from('sessions')
      .select('correct_count, total_count, created_at')
      .eq('user_id', user.id)
      .gte('created_at', windowStart),
  ]);

  if (progressResult.error) console.error('[home] user_progress 조회 실패:', progressResult.error);
  if (sessionsResult.error) console.error('[home] sessions 조회 실패:', sessionsResult.error);

  const progress = ProgressSummarySchema.safeParse(progressResult.data);
  const sessions = SessionSummaryListSchema.safeParse(sessionsResult.data ?? []);

  if (progressResult.data && !progress.success) {
    console.error('[home] user_progress 형식 오류:', progress.error);
  }

  if (!sessions.success) {
    console.error('[home] sessions 형식 오류:', sessions.error);
  }

  const rows: SessionSummary[] = sessions.success ? sessions.data : [];
  const dayStart = getKstDayStart();

  const todayCompleted = rows.filter((row) => new Date(row.created_at) >= dayStart).length;
  const correctTotal = rows.reduce((sum, row) => sum + (row.correct_count ?? 0), 0);
  const answeredTotal = rows.reduce((sum, row) => sum + (row.total_count ?? 0), 0);

  const streak = progress.success ? (progress.data.streak ?? 0) : 0;

  return {
    greeting: HOME_GREETING,
    // 마지막 접속 바와 하단 '연속 일수'는 같은 연속 학습일을 다른 형태로 보여준다.
    accessStreak: streak,
    accessStreakMax: ACCESS_STREAK_MAX_DAYS,
    stage: progress.success ? (progress.data.stage ?? 1) : 1,
    xp: progress.success ? (progress.data.xp ?? 0) : 0,
    xpForNextLevel: XP_FOR_NEXT_LEVEL,
    todayCompleted,
    learnStreak: streak,
    accuracyPercent: toPercent(correctTotal, answeredTotal),
  };
}
