import { NextResponse } from 'next/server';

import { DEFAULT_MOOD_VALUE } from '@/constants/avatar';
import { moodFromValue } from '@/constants/mood';
import { createClient } from '@/lib/supabase/server';
import { AvatarStatusSchema } from '@/schemas/avatar-status.schema';

export async function GET() {
  const supabase = await createClient();

  // 조회 시점에 마지막 정산 이후 경과분만큼 mood_value를 깎아 되쓰는 lazy 감쇠를 RPC 한 곳에서 처리한다
  // (get_avatar_status). 유저 식별은 함수 내부 auth.uid()가 하고 RLS(본인 아바타)로 스코프되므로 별도
  // getUser·조인이 필요 없다(왕복 1). 미인증/상태행 없음이면 빈 결과 → 기본 감정 수치로 폴백한다.
  const { data, error } = await supabase
    .rpc('get_avatar_status')
    .maybeSingle<{ mood_value: number; updated_at: string }>();

  if (error) {
    console.error('[avatar-status] 조회 실패:', error);

    return NextResponse.json({ message: '감정 상태를 불러오지 못했습니다.' }, { status: 500 });
  }

  // DB 값이 범위(0~100)를 벗어나거나 비정수여도 스키마(z.number().int())에서 throw나지 않도록
  // 클램프 후 반올림한다. 클램프만으로는 소수점이 남아 int 검증이 잡히지 않는 500을 낼 수 있다.
  const moodValue = Math.round(Math.min(100, Math.max(0, data?.mood_value ?? DEFAULT_MOOD_VALUE)));

  // 수치→라벨 가공은 여기(서버)서 끝내고, 프론트는 표시만 하도록 mood를 함께 내려준다.
  const body = AvatarStatusSchema.parse({
    moodValue,
    mood: moodFromValue(moodValue),
    updatedAt: data ? new Date(data.updated_at).toISOString() : new Date().toISOString(),
  });

  return NextResponse.json(body);
}
