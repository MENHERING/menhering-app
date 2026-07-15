import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';

import { ApiError, toErrorResult } from '@/lib/api-error';
import { toSuccessResult } from '@/lib/api-response';
import { createClient } from '@/lib/supabase/server';
import { buildWrongNoteOptions } from '@/lib/wrong-note/build-wrong-note-options';
import {
  WrongAnswerSchema,
  WrongNoteItemSchema,
  type QuestionLevel,
  type ReviewStatus,
  type WrongNoteItem,
} from '@/schemas/wrong-note.schema';
import type { WrongAnswerRow } from '@/types/wrong-note/db';

interface WrongAnswerDetailRow {
  id: string;
  question_id: string;
  selected_answer: number;
  review_status: ReviewStatus;
  created_at: string;
}

interface QuestionDetailRow {
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

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!z.uuid().safeParse(id).success) {
      throw new ApiError(400, '올바르지 않은 오답 기록 id입니다.');
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new ApiError(401, '로그인이 필요합니다.');
    }

    const { data: wrongAnswer, error: wrongAnswerError } = await supabase
      .from('wrong_answers')
      .select('id, question_id, selected_answer, review_status, created_at')
      .eq('id', id)
      .eq('user_id', user.id)
      .single<WrongAnswerDetailRow>();

    if (wrongAnswerError || !wrongAnswer) {
      throw new ApiError(404, '존재하지 않는 오답 기록입니다.');
    }

    const { data: question, error: questionError } = await supabase
      .from('questions')
      .select(
        'level, stage, label, content, option_1, option_2, option_3, option_4, answer, explanation',
      )
      .eq('id', wrongAnswer.question_id)
      .single<QuestionDetailRow>();

    if (questionError || !question) {
      throw new ApiError(500, '오답 기록에 연결된 문제를 찾을 수 없습니다.');
    }

    const item: WrongNoteItem = {
      id: wrongAnswer.id,
      level: question.level,
      stage: question.stage,
      label: question.label,
      question: question.content,
      options: buildWrongNoteOptions(question, wrongAnswer.selected_answer),
      reviewStatus: wrongAnswer.review_status,
      createdAt: wrongAnswer.created_at,
      explanation: question.explanation,
    };

    const { body, status } = toSuccessResult(WrongNoteItemSchema, item);

    return NextResponse.json(body, { status });
  } catch (error) {
    const { body, status } = toErrorResult(error);

    return NextResponse.json(body, { status });
  }
}

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!z.uuid().safeParse(id).success) {
      throw new ApiError(400, '올바르지 않은 오답 기록 id입니다.');
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new ApiError(401, '로그인이 필요합니다.');
    }

    const { data: wrongAnswer, error } = await supabase
      .from('wrong_answers')
      .update({ review_status: 'reviewed', reviewed_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single<WrongAnswerRow>();

    if (error || !wrongAnswer) {
      throw new ApiError(404, '존재하지 않는 오답 기록입니다.');
    }

    const { body, status } = toSuccessResult(WrongAnswerSchema, {
      id: wrongAnswer.id,
      questionId: wrongAnswer.question_id,
      sessionId: wrongAnswer.session_id,
      selectedAnswer: wrongAnswer.selected_answer,
      correctAnswer: wrongAnswer.correct_answer,
      reviewStatus: wrongAnswer.review_status,
      createdAt: wrongAnswer.created_at,
      reviewedAt: wrongAnswer.reviewed_at,
    });

    return NextResponse.json(body, { status });
  } catch (error) {
    const { body, status } = toErrorResult(error);

    return NextResponse.json(body, { status });
  }
}
