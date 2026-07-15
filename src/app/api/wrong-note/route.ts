import { NextResponse, type NextRequest } from 'next/server';

import { ApiError, toErrorResult } from '@/lib/api-error';
import { toSuccessResult } from '@/lib/api-response';
import { createClient } from '@/lib/supabase/server';
import { buildWrongNoteOptions } from '@/lib/wrong-note/build-wrong-note-options';
import {
  RecordWrongAnswerSchema,
  WrongAnswerSchema,
  WrongNoteListSchema,
  type QuestionLevel,
  type ReviewStatus,
  type WrongNoteItem,
  type WrongNoteStats,
} from '@/schemas/wrong-note.schema';
import type { WrongAnswerRow } from '@/types/wrong-note/db';

const DEFAULT_LIMIT = 10;

interface WrongAnswerListRow {
  id: string;
  question_id: string;
  selected_answer: number;
  review_status: ReviewStatus;
  created_at: string;
}

interface QuestionJoinRow {
  id: string;
  level: QuestionLevel;
  stage: number;
  label: string;
  content: string;
  option_1: string;
  option_2: string;
  option_3: string;
  option_4: string;
  answer: string;
  explanation: string;
}

interface QuestionAnswerRow {
  option_1: string;
  option_2: string;
  option_3: string;
  option_4: string;
  answer: string;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new ApiError(401, '로그인이 필요합니다.');
    }

    const { searchParams } = request.nextUrl;
    const cursor = searchParams.get('cursor');
    const limit = Number(searchParams.get('limit')) || DEFAULT_LIMIT;

    let query = supabase
      .from('wrong_answers')
      .select('id, question_id, selected_answer, review_status, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit + 1);

    if (cursor) {
      query = query.lt('created_at', cursor);
    }

    const { data: wrongAnswers, error: wrongAnswersError } =
      await query.returns<WrongAnswerListRow[]>();

    if (wrongAnswersError) {
      throw new ApiError(500, '오답노트 목록을 불러오지 못했습니다.');
    }

    const hasNextPage = wrongAnswers.length > limit;
    const page = hasNextPage ? wrongAnswers.slice(0, limit) : wrongAnswers;
    const questionIds = [...new Set(page.map((row) => row.question_id))];

    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select(
        'id, level, stage, label, content, option_1, option_2, option_3, option_4, answer, explanation',
      )
      .in('id', questionIds)
      .returns<QuestionJoinRow[]>();

    if (questionsError) {
      throw new ApiError(500, '오답노트 목록을 불러오지 못했습니다.');
    }

    const questionMap = new Map(questions.map((question) => [question.id, question]));

    const items: WrongNoteItem[] = page.map((row) => {
      const question = questionMap.get(row.question_id);

      if (!question) {
        throw new ApiError(500, '오답 기록에 연결된 문제를 찾을 수 없습니다.');
      }

      return {
        id: row.id,
        level: question.level,
        stage: question.stage,
        label: question.label,
        question: question.content,
        options: buildWrongNoteOptions(question, row.selected_answer),
        reviewStatus: row.review_status,
        createdAt: row.created_at,
        explanation: question.explanation,
      };
    });

    const nextCursor = hasNextPage ? page[page.length - 1].created_at : null;

    const [{ count: total, error: totalError }, { count: unreviewed, error: unreviewedError }] =
      await Promise.all([
        supabase
          .from('wrong_answers')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id),
        supabase
          .from('wrong_answers')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('review_status', 'unreviewed'),
      ]);

    if (totalError || unreviewedError || total === null || unreviewed === null) {
      throw new ApiError(500, '오답노트 통계를 불러오지 못했습니다.');
    }

    const stats: WrongNoteStats = { total, unreviewed, reviewed: total - unreviewed };

    const { body, status } = toSuccessResult(WrongNoteListSchema, { items, nextCursor, stats });

    return NextResponse.json(body, { status });
  } catch (error) {
    const { body, status } = toErrorResult(error);

    return NextResponse.json(body, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new ApiError(401, '로그인이 필요합니다.');
    }

    const parsed = RecordWrongAnswerSchema.safeParse(await request.json());

    if (!parsed.success) {
      throw new ApiError(400, '요청 형식이 올바르지 않습니다.');
    }

    const { questionId, sessionId, selectedAnswer } = parsed.data;

    const { data: question, error: questionError } = await supabase
      .from('questions')
      .select('option_1, option_2, option_3, option_4, answer')
      .eq('id', questionId)
      .single<QuestionAnswerRow>();

    if (questionError || !question) {
      throw new ApiError(404, '존재하지 않는 문제입니다.');
    }

    const optionTexts = [
      question.option_1,
      question.option_2,
      question.option_3,
      question.option_4,
    ];
    const correctAnswer = optionTexts.findIndex((text) => text === question.answer) + 1;

    if (correctAnswer === 0) {
      throw new ApiError(500, '문제의 정답 데이터가 올바르지 않습니다.');
    }

    if (selectedAnswer === correctAnswer) {
      throw new ApiError(400, '정답을 오답으로 기록할 수 없습니다.');
    }

    const { data: wrongAnswer, error: upsertError } = await supabase
      .from('wrong_answers')
      .upsert(
        {
          user_id: user.id,
          question_id: questionId,
          session_id: sessionId ?? null,
          selected_answer: selectedAnswer,
          correct_answer: correctAnswer,
          review_status: 'unreviewed',
          reviewed_at: null,
          created_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,question_id' },
      )
      .select()
      .single<WrongAnswerRow>();

    if (upsertError || !wrongAnswer) {
      throw new ApiError(500, '오답 기록을 저장하지 못했습니다.');
    }

    const { body, status } = toSuccessResult(
      WrongAnswerSchema,
      {
        id: wrongAnswer.id,
        questionId: wrongAnswer.question_id,
        sessionId: wrongAnswer.session_id,
        selectedAnswer: wrongAnswer.selected_answer,
        correctAnswer: wrongAnswer.correct_answer,
        reviewStatus: wrongAnswer.review_status,
        createdAt: wrongAnswer.created_at,
        reviewedAt: wrongAnswer.reviewed_at,
      },
      'Created',
      201,
    );

    return NextResponse.json(body, { status });
  } catch (error) {
    const { body, status } = toErrorResult(error);

    return NextResponse.json(body, { status });
  }
}
