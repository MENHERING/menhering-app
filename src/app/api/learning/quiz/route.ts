import { NextResponse } from 'next/server';

import { ApiError, toErrorResult } from '@/lib/api-error';
import { toSuccessResult } from '@/lib/api-response';
import { createClient } from '@/lib/supabase/server';
import { QuizQuestionListSchema } from '@/schemas/learning-quiz.schema';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level');
    const stage = Number(searchParams.get('stage'));

    if (!level || !Number.isInteger(stage)) {
      throw new ApiError(400, 'level, stage 쿼리가 필요합니다.');
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new ApiError(401, '로그인이 필요합니다.');

    const { data, error } = await supabase
      .from('questions')
      .select(
        'id, content, option_1, option_2, option_3, option_4, answer, explanation, created_at',
      )
      .eq('level', level)
      .eq('stage', stage)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[learning/quiz] 조회 실패:', error);
      throw new ApiError(500, '문제를 불러오지 못했습니다.');
    }

    if (!data || data.length === 0) {
      throw new ApiError(404, '해당 스테이지 문제가 없습니다.');
    }

    // answer는 정답 보기의 텍스트라 option_1~4와 대조해 몇 번째인지(0-based)를 서버가 계산해 내려준다.
    const questions = data.map((row, index) => {
      const options = [row.option_1, row.option_2, row.option_3, row.option_4];

      return {
        id: row.id,
        order: index + 1,
        prompt: row.content,
        options,
        correctIndex: options.findIndex((option) => option === row.answer),
        explanation: row.explanation,
      };
    });

    const { body, status } = toSuccessResult(QuizQuestionListSchema, questions);

    return NextResponse.json(body, { status });
  } catch (error) {
    const { body, status } = toErrorResult(error);

    return NextResponse.json(body, { status });
  }
}
