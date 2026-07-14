import { NextResponse } from 'next/server';

import { CURRICULUM_TOTAL_COUNT } from '@/constants/curriculum';
import { LEVELS } from '@/constants/level';
import { createClient } from '@/lib/supabase/server';
import { LearningProgressSchema } from '@/schemas/learning-progress.schema';

const DEFAULT_LEVEL_TITLE = LEVELS[2].title; // 온보딩 전(행 없음) 유저 폴백: 중급
const DEFAULT_STAGE = 1;

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: '로그인이 필요합니다.' }, { status: 401 });
  }

  const { data: progress, error } = await supabase
    .from('user_progress')
    .select('level, stage')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    console.error('[learning/progress] 조회 실패:', error);
    return NextResponse.json({ message: '진행도를 불러오지 못했습니다.' }, { status: 500 });
  }

  const myLevelTitle = progress?.level ?? DEFAULT_LEVEL_TITLE;
  const myStage = progress?.stage ?? DEFAULT_STAGE;
  const myStep = LEVELS.find((l) => l.title === myLevelTitle)?.step ?? LEVELS[2].step;

  // 지나온 레벨은 전부 클리어, 지금 레벨은 stage-1개 클리어, 아직 안 온 레벨은 0(잠김).
  const curricula = LEVELS.map((l) => {
    const totalCount = CURRICULUM_TOTAL_COUNT[l.title];
    const clearedCount =
      l.step < myStep ? totalCount : l.step === myStep ? Math.max(0, myStage - 1) : 0;

    return { level: l.title, step: l.step, clearedCount, totalCount };
  });

  const body = LearningProgressSchema.parse({ myStep, curricula });

  return NextResponse.json(body);
}
