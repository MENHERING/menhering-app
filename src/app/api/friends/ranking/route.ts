import { NextResponse } from 'next/server';

import { DEFAULT_CHARACTER_TYPE, DEFAULT_COLOR_THEME } from '@/constants/avatar';
import { ApiError, toErrorResult } from '@/lib/api-error';
import { toSuccessResult } from '@/lib/api-response';
import { createClient } from '@/lib/supabase/server';
import { RankingEntryListSchema, type RankingEntry } from '@/schemas/ranking.schema';
import type { CharacterType, ColorTheme } from '@/types/avatar';

interface FriendRankingRow {
  user_id: string;
  nickname: string;
  character_type: CharacterType | null;
  color_theme: ColorTheme | null;
  xp: number;
  days_since_active: number | null;
  streak: number | null;
  is_me: boolean;
}

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc('get_friend_ranking');

    if (error) {
      if (error.code === '28000') throw new ApiError(401, '로그인이 필요합니다.');

      console.error('[friends/ranking] 조회 실패:', error);
      throw new ApiError(500, '랭킹을 불러오지 못했습니다.');
    }

    // Database 타입 생성이 없어 supabase-js가 rpc() 반환 타입을 추론하지 못한다(.returns()가
    // 신뢰할 수 없는 유니온 타입을 만든다). RPC 반환 shape를 직접 명시한 행 타입으로 받는다.
    const rows: FriendRankingRow[] = data;

    // 응답은 이미 xp 내림차순(RPC의 order by)이라 배열 인덱스가 곧 순위다.
    const entries: RankingEntry[] = rows.map((row, index) => ({
      rank: index + 1,
      userId: row.user_id,
      nickname: row.nickname,
      characterType: row.character_type ?? DEFAULT_CHARACTER_TYPE,
      colorTheme: row.color_theme ?? DEFAULT_COLOR_THEME,
      xp: row.xp,
      isMe: row.is_me,
      ...(row.is_me
        ? { streakDays: row.streak ?? 0 }
        : {
            lastActiveLabel:
              row.days_since_active == null
                ? undefined
                : row.days_since_active <= 0
                  ? '오늘 접속'
                  : `${row.days_since_active}일 전 접속`,
          }),
    }));

    const { body, status } = toSuccessResult(RankingEntryListSchema, entries);

    return NextResponse.json(body, { status });
  } catch (error) {
    if (!(error instanceof ApiError)) {
      console.error('[friends/ranking] 예기치 못한 오류:', error);
    }

    const { body, status } = toErrorResult(error);

    return NextResponse.json(body, { status });
  }
}
