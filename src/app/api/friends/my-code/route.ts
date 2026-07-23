import { NextResponse } from 'next/server';

import { ApiError, toErrorResult } from '@/lib/api-error';
import { toSuccessResult } from '@/lib/api-response';
import { createClient } from '@/lib/supabase/server';
import { MyFriendCodeSchema } from '@/schemas/friend.schema';

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc('get_my_friend_code');

    if (error) {
      // RPC가 미인증 시 raise(errcode 28000). 401로 매핑해야 privateFetch가 /login으로 보낸다.
      if (error.code === '28000') throw new ApiError(401, '로그인이 필요합니다.');

      console.error('[friends/my-code] 조회 실패:', error);
      throw new ApiError(500, '내 친구 코드를 불러오지 못했습니다.');
    }

    // DB 값을 그대로 믿지 않고 런타임에 검증한다(타입 단언 대신).
    const { body, status } = toSuccessResult(MyFriendCodeSchema, { code: data });

    return NextResponse.json(body, { status });
  } catch (error) {
    if (!(error instanceof ApiError)) {
      console.error('[friends/my-code] 예기치 못한 오류:', error);
    }

    const { body, status } = toErrorResult(error);

    return NextResponse.json(body, { status });
  }
}
