import { NextResponse, type NextRequest } from 'next/server';

import { ApiError, toErrorResult } from '@/lib/api-error';
import { toSuccessResult } from '@/lib/api-response';
import { createClient } from '@/lib/supabase/server';
import {
  FriendRequestActionResultSchema,
  PendingFriendRequestListSchema,
  SendFriendRequestSchema,
  type PendingFriendRequest,
} from '@/schemas/friend.schema';

interface PendingFriendRequestRow {
  request_id: string;
  sender_id: string;
  nickname: string;
  character_type: string | null;
  color_theme: string | null;
  level: number;
  created_at: string;
}

interface FriendRow {
  id: string;
  status: string;
}

// RPC가 raise한 SQLSTATE → HTTP 상태/메시지. 던진 메시지를 그대로 신뢰하지 않고 코드로 매핑해,
// 원인 메시지가 바뀌어도 노출 문구를 route가 통제한다 (avatar/actions.ts의 BUY_ERROR_MESSAGE와 동일 규약).
const SEND_ERROR_MAP: Record<string, { status: number; message: string }> = {
  '22023': { status: 400, message: '자신에게는 친구 요청을 보낼 수 없습니다.' },
  PT409: { status: 409, message: '이미 친구이거나 대기 중인 요청이 있습니다.' },
};

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc('get_pending_friend_requests');

    if (error) {
      if (error.code === '28000') throw new ApiError(401, '로그인이 필요합니다.');

      console.error('[friends/requests] 조회 실패:', error);
      throw new ApiError(500, '받은 친구 요청을 불러오지 못했습니다.');
    }

    // Database 타입 생성이 없어 supabase-js가 rpc() 반환 타입을 추론하지 못한다(.returns()가
    // 신뢰할 수 없는 유니온 타입을 만든다). RPC 반환 shape를 직접 명시한 행 타입으로 받는다.
    const rows: PendingFriendRequestRow[] = data;

    const items: PendingFriendRequest[] = rows.map((row) => ({
      requestId: row.request_id,
      senderId: row.sender_id,
      nickname: row.nickname,
      characterType: row.character_type,
      colorTheme: row.color_theme,
      level: row.level,
      createdAt: row.created_at,
    }));

    const { body, status } = toSuccessResult(PendingFriendRequestListSchema, items);

    return NextResponse.json(body, { status });
  } catch (error) {
    if (!(error instanceof ApiError)) {
      console.error('[friends/requests] 예기치 못한 오류:', error);
    }

    const { body, status } = toErrorResult(error);

    return NextResponse.json(body, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const parsed = SendFriendRequestSchema.safeParse(requestBody);

    if (!parsed.success) {
      throw new ApiError(400, '올바르지 않은 요청입니다.');
    }

    const supabase = await createClient();

    const { data, error } = await supabase.rpc('send_friend_request', {
      p_target_user_id: parsed.data.targetUserId,
    });

    if (error) {
      if (error.code === '28000') throw new ApiError(401, '로그인이 필요합니다.');

      const mapped = SEND_ERROR_MAP[error.code ?? ''];

      if (mapped) throw new ApiError(mapped.status, mapped.message);

      console.error('[friends/requests] 요청 생성 실패:', error);
      throw new ApiError(500, '친구 요청을 보내지 못했습니다.');
    }

    const row: FriendRow = data;

    const { body, status } = toSuccessResult(FriendRequestActionResultSchema, {
      id: row.id,
      status: row.status,
    });

    return NextResponse.json(body, { status });
  } catch (error) {
    if (!(error instanceof ApiError)) {
      console.error('[friends/requests] 예기치 못한 오류:', error);
    }

    const { body, status } = toErrorResult(error);

    return NextResponse.json(body, { status });
  }
}
