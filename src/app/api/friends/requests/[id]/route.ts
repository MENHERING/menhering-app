import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';

import { ApiError, toErrorResult } from '@/lib/api-error';
import { toSuccessResult } from '@/lib/api-response';
import { createClient } from '@/lib/supabase/server';
import {
  FriendRequestActionResultSchema,
  RespondFriendRequestSchema,
} from '@/schemas/friend.schema';

interface FriendRow {
  id: string;
  status: string;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!z.uuid().safeParse(id).success) {
      throw new ApiError(400, '올바르지 않은 요청 id입니다.');
    }

    const requestBody = await request.json();
    const parsed = RespondFriendRequestSchema.safeParse(requestBody);

    if (!parsed.success) {
      throw new ApiError(400, '올바르지 않은 요청입니다.');
    }

    const supabase = await createClient();

    const { data, error } = await supabase.rpc('respond_friend_request', {
      p_request_id: id,
      p_action: parsed.data.action,
    });

    if (error) {
      if (error.code === '28000') throw new ApiError(401, '로그인이 필요합니다.');
      if (error.code === 'PT404') throw new ApiError(404, '처리할 수 없는 요청입니다.');

      console.error('[friends/requests/:id] 응답 처리 실패:', error);
      throw new ApiError(500, '요청 처리에 실패했습니다.');
    }

    const row: FriendRow = data;

    const { body, status } = toSuccessResult(FriendRequestActionResultSchema, {
      id: row.id,
      status: row.status,
    });

    return NextResponse.json(body, { status });
  } catch (error) {
    if (!(error instanceof ApiError)) {
      console.error('[friends/requests/:id] 예기치 못한 오류:', error);
    }

    const { body, status } = toErrorResult(error);

    return NextResponse.json(body, { status });
  }
}
