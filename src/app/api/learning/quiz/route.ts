import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { QuizQuestionListSchema } from '@/schemas/learning-quiz.schema';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const level = searchParams.get('level');
  const stage = Number(searchParams.get('stage'));

  if (!level || !Number.isInteger(stage)) {
    return NextResponse.json({ message: 'level, stage 쿼리가 필요합니다.' }, { status: 400 });
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: '로그인이 필요합니다.' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('questions')
    .select('id, content, option_1, option_2, option_3, option_4, answer, explanation, created_at')
    .eq('level', level)
    .eq('stage', stage)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[learning/quiz] 조회 실패:', error);
    return NextResponse.json({ message: '문제를 불러오지 못했습니다.' }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ message: '해당 스테이지 문제가 없습니다.' }, { status: 404 });
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

  const body = QuizQuestionListSchema.parse(questions);

  return NextResponse.json(body);
}
