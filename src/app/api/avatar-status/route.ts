import { NextResponse } from 'next/server';

import { DEFAULT_MOOD_VALUE } from '@/constants/avatar';
import { moodFromValue } from '@/constants/mood';
import { ApiError, toErrorResult } from '@/lib/api-error';
import { toSuccessResult } from '@/lib/api-response';
import { createClient } from '@/lib/supabase/server';
import { AvatarStatusSchema } from '@/schemas/avatar-status.schema';

export async function GET() {
  try {
    const supabase = await createClient();

    // 조회 시점에 마지막 정산 이후 경과분만큼 mood_value를 깎아 되쓰는 lazy 감쇠를 RPC 한 곳에서 처리한다
    // (get_avatar_status). 유저 식별은 함수 내부 auth.uid()가 하고 RLS(본인 아바타)로 스코프되므로 별도
    // getUser·조인이 필요 없다(왕복 1). 미인증/상태행 없음이면 빈 결과 → 기본 감정 수치로 폴백한다.
    const { data, error } = await supabase
      .rpc('get_avatar_status')
      .maybeSingle<{ mood_value: number; updated_at: string }>();

    if (error) {
      // RPC가 미인증 시 raise(errcode 28000). 401로 매핑해야 privateFetch가 /login으로 보낸다
      // (save_avatar/buy_avatar_item의 28000 매핑과 동일 규약). 비로그인·세션 만료는 정상적으로
      // 예상되는 조건이라 에러 로그를 남기지 않는다 — 남기면 진짜 장애(500)가 그 노이즈에 묻힌다.
      if (error.code === '28000') throw new ApiError(401, '로그인이 필요합니다.');

      console.error('[avatar-status] 조회 실패:', error);

      throw new ApiError(500, '감정 상태를 불러오지 못했습니다.');
    }

    // DB 값이 범위(0~100)를 벗어나거나 비정수·NaN이어도 스키마(z.number().int())에서 throw나지 않도록
    // 유한수 검사 → 클램프 → 반올림 순으로 정규화한다. ??는 null/undefined만 걸러 NaN을 통과시키고
    // (Math.round(NaN)=NaN), 클램프만으로는 소수점이 남아 둘 다 int 검증에 걸린다.
    const rawMoodValue = data?.mood_value ?? DEFAULT_MOOD_VALUE;
    const moodValue = Math.round(
      Math.min(100, Math.max(0, Number.isFinite(rawMoodValue) ? rawMoodValue : DEFAULT_MOOD_VALUE)),
    );

    // 수치→라벨 가공은 여기(서버)서 끝내고, 프론트는 표시만 하도록 mood를 함께 내려준다.
    // 공용 응답 포맷({ statusCode, message, data })으로 감싸 coreFetch가 data만 꺼내 쓰게 한다.
    // 상태행이 없으면(아바타 미저장) updatedAt은 null — now()를 지어내면 "데이터 없음"과
    // "방금 갱신됨"을 클라이언트가 구분할 수 없다.
    const { body, status } = toSuccessResult(AvatarStatusSchema, {
      moodValue,
      mood: moodFromValue(moodValue),
      updatedAt: data ? new Date(data.updated_at).toISOString() : null,
    });

    return NextResponse.json(body, { status });
  } catch (error) {
    // toErrorResult는 ApiError가 아닌 예외를 전부 500 'Internal Server Error'로 뭉개고 로깅하지 않는다.
    // 여기서 안 찍으면 스키마 드리프트(ZodError)·createClient 실패 같은 예기치 못한 오류가 서버에
    // 아무 흔적도 남기지 않는다. 의도된 오류(ApiError)는 throw 지점에서 이미 로깅했으므로 제외한다.
    if (!(error instanceof ApiError)) {
      console.error('[avatar-status] 예기치 못한 오류:', error);
    }

    const { body, status } = toErrorResult(error);

    return NextResponse.json(body, { status });
  }
}
