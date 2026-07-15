import { NextResponse } from 'next/server';

import { ApiError, toErrorResult } from '@/lib/api-error';
import { toSuccessResult } from '@/lib/api-response';
import { createClient } from '@/lib/supabase/server';
import { SubmitQuizRequestSchema, SubmitQuizResultSchema } from '@/schemas/learning-quiz.schema';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new ApiError(401, '로그인이 필요합니다.');

    const parsed = SubmitQuizRequestSchema.safeParse(await request.json());

    if (!parsed.success) {
      throw new ApiError(400, '요청 형식이 올바르지 않습니다.');
    }

    const { level, stage, answers, durationSec } = parsed.data;

    // 채점·진행도·행복도 갱신은 전부 submit_quiz_result RPC(서버 권위, 원자적) 안에서 처리한다.
    const { data, error } = await supabase.rpc('submit_quiz_result', {
      p_level: level,
      p_stage: stage,
      p_answers: answers.map((answer) => ({
        question_id: answer.questionId,
        selected_option: answer.selectedOption,
      })),
      p_duration_sec: durationSec ?? null,
    });

    if (error) {
      console.error('[learning/quiz/submit] 실패:', error);
      throw new ApiError(500, '제출에 실패했습니다.');
    }

    const { body, status } = toSuccessResult(SubmitQuizResultSchema, data);

    return NextResponse.json(body, { status });
  } catch (error) {
    const { body, status } = toErrorResult(error);

    return NextResponse.json(body, { status });
  }
}
