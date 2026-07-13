import { NextResponse } from 'next/server';

import { DEFAULT_MOOD_VALUE } from '@/constants/avatar';
import { moodFromValue } from '@/constants/mood';
import { createClient } from '@/lib/supabase/server';
import { AvatarStatusSchema } from '@/schemas/avatar-status.schema';

export async function GET() {
  const supabase = await createClient();

  // RLS(`본인 조회`: avatar_id가 auth.uid() 소유 아바타)로 이미 본인 행만 걸러지므로,
  // getUser나 avatars 조인 없이 한 번의 조회로 끝낸다(왕복 3→1). 라우트는 proxy가 인증 보호하고,
  // 비로그인/행 없음이면 빈 결과 → 기본 감정 수치로 폴백한다.
  const { data, error } = await supabase
    .from('avatar_status')
    .select('mood_value, updated_at')
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('[avatar-status] 조회 실패:', error);

    return NextResponse.json({ message: '감정 상태를 불러오지 못했습니다.' }, { status: 500 });
  }

  // DB 값이 범위를 벗어나도(0~100 밖) 스키마 검증에서 throw나지 않도록 클램프한다.
  const moodValue = Math.min(100, Math.max(0, data?.mood_value ?? DEFAULT_MOOD_VALUE));

  // 수치→라벨 가공은 여기(서버)서 끝내고, 프론트는 표시만 하도록 mood를 함께 내려준다.
  const body = AvatarStatusSchema.parse({
    moodValue,
    mood: moodFromValue(moodValue),
    updatedAt: data ? new Date(data.updated_at).toISOString() : new Date().toISOString(),
  });

  return NextResponse.json(body);
}
