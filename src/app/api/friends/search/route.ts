import { NextResponse, type NextRequest } from 'next/server';

import { ApiError, toErrorResult } from '@/lib/api-error';
import { toSuccessResult } from '@/lib/api-response';
import { createClient } from '@/lib/supabase/server';
import {
  FriendCandidateListSchema,
  SearchFriendsQuerySchema,
  type FriendCandidate,
} from '@/schemas/friend.schema';

interface FriendCandidateRow {
  user_id: string;
  nickname: string;
  friend_code: string;
  character_type: string | null;
  color_theme: string | null;
  level: number;
  request_status: FriendCandidate['requestStatus'];
}

export async function GET(request: NextRequest) {
  try {
    const parsed = SearchFriendsQuerySchema.safeParse({
      keyword: request.nextUrl.searchParams.get('keyword'),
    });

    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0]?.message ?? '올바르지 않은 검색어입니다.');
    }

    const supabase = await createClient();

    const { data, error } = await supabase.rpc('search_friend_candidates', {
      p_keyword: parsed.data.keyword,
    });

    if (error) {
      if (error.code === '28000') throw new ApiError(401, '로그인이 필요합니다.');

      console.error('[friends/search] 조회 실패:', error);
      throw new ApiError(500, '친구 검색에 실패했습니다.');
    }

    // Database 타입 생성이 없어 supabase-js가 rpc() 반환 타입을 추론하지 못한다(.returns()가
    // 신뢰할 수 없는 유니온 타입을 만든다). RPC 반환 shape를 직접 명시한 행 타입으로 받는다.
    const rows: FriendCandidateRow[] = data;

    const items: FriendCandidate[] = rows.map((row) => ({
      userId: row.user_id,
      nickname: row.nickname,
      friendCode: row.friend_code,
      characterType: row.character_type,
      colorTheme: row.color_theme,
      level: row.level,
      requestStatus: row.request_status,
    }));

    const { body, status } = toSuccessResult(FriendCandidateListSchema, items);

    return NextResponse.json(body, { status });
  } catch (error) {
    if (!(error instanceof ApiError)) {
      console.error('[friends/search] 예기치 못한 오류:', error);
    }

    const { body, status } = toErrorResult(error);

    return NextResponse.json(body, { status });
  }
}
