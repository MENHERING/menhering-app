import { NextResponse } from 'next/server';

import { CURRICULUM_TOTAL_COUNT } from '@/constants/curriculum';
import { LEVELS } from '@/constants/level';
import { ApiError, toErrorResult } from '@/lib/api-error';
import { toSuccessResult } from '@/lib/api-response';
import { createClient } from '@/lib/supabase/server';
import { LearningProgressSchema } from '@/schemas/learning-progress.schema';

const DEFAULT_LEVEL_TITLE = LEVELS[2].title; // 온보딩 전(행 없음) 유저 폴백: 중급

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new ApiError(401, '로그인이 필요합니다.');

    // user_progress: 레벨테스트로 배정된 레벨(=잠금 기준)만 본다.
    // user_level_progress: 레벨별로 독립적인 stage 포인터 — 배정 레벨보다 낮은 레벨도
    // "이미 다 클리어"로 퉁치지 않고, 실제로 어디까지 풀었는지 따로 추적한다.
    const [{ data: progress, error: progressError }, { data: levelProgress, error: levelError }] =
      await Promise.all([
        supabase.from('user_progress').select('level').eq('user_id', user.id).maybeSingle(),
        supabase.from('user_level_progress').select('level, stage').eq('user_id', user.id),
      ]);

    if (progressError || levelError) {
      console.error('[learning/progress] 조회 실패:', progressError ?? levelError);
      throw new ApiError(500, '진행도를 불러오지 못했습니다.');
    }

    const myLevelTitle = progress?.level ?? DEFAULT_LEVEL_TITLE;
    const myStep = LEVELS.find((l) => l.title === myLevelTitle)?.step ?? LEVELS[2].step;
    const stageByLevel = new Map((levelProgress ?? []).map((row) => [row.level, row.stage]));

    // 배정 레벨 이하는 각자 독립적으로 (아직 안 풀었으면 0), 그보다 높은 레벨은 잠김(0).
    const curricula = LEVELS.map((l) => {
      const totalCount = CURRICULUM_TOTAL_COUNT[l.title];
      const stage = stageByLevel.get(l.title) ?? 1; // 행이 없으면 아직 1번 스테이지 전(클리어 0)
      const clearedCount = l.step <= myStep ? Math.max(0, stage - 1) : 0;

      return { level: l.title, step: l.step, clearedCount, totalCount };
    });

    const { body, status } = toSuccessResult(LearningProgressSchema, { myStep, curricula });

    return NextResponse.json(body, { status });
  } catch (error) {
    const { body, status } = toErrorResult(error);

    return NextResponse.json(body, { status });
  }
}
