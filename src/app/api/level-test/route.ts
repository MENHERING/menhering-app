import { NextResponse } from 'next/server';

import { LEVELS } from '@/constants/level';
import { ApiError, toErrorResult } from '@/lib/api-error';
import { toSuccessResult } from '@/lib/api-response';
import { createClient } from '@/lib/supabase/server';
import { LevelTestQuestionListSchema } from '@/schemas/level-test.schema';

// 난이도별 대표 문항을 뽑아올 스테이지. 1스테이지는 학습을 시작하면 바로 만나는 구간이라
// 테스트에서 미리 보여주면 첫 학습이 그대로 반복된다. 한 칸 뒤에서 뽑아 겹침을 줄인다.
const SAMPLE_STAGE = 2;

// 보기를 섞는다. 현재 데이터는 정답이 특정 위치(대부분 2번)에 몰려 있어, 섞지 않으면 같은 자리만
// 계속 찍어도 대부분 정답이 되어 추천 레벨이 부풀려진다. 정답 판정은 섞은 뒤의 위치로 다시 계산한다.
// (학습 탭 퀴즈는 섞지 않는다 — 거기서는 정답 위치가 레벨 산정에 영향을 주지 않기 때문이다.)
function shuffle<T>(items: T[]): T[] {
  const shuffled = [...items];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

// 온보딩 레벨 테스트 문항 조회. 입문~전문가에서 한 문항씩, 쉬운 난이도부터 순서대로 내려준다.
// 채점은 클라이언트가 한다 — 결과가 추천값일 뿐이고(사용자가 결과 화면에서 다시 고를 수 있다),
// 확정된 레벨은 어차피 saveOnboardingLevel 서버 액션이 저장하기 때문이다.
export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new ApiError(401, '로그인이 필요합니다.');

    const { data, error } = await supabase
      .from('questions')
      .select('id, level, content, option_1, option_2, option_3, option_4, answer')
      .eq('stage', SAMPLE_STAGE)
      .in(
        'level',
        LEVELS.map((level) => level.title),
      )
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[level-test] 조회 실패:', error);
      throw new ApiError(500, '문제를 불러오지 못했습니다.');
    }

    // LEVELS 순서(쉬움 → 어려움)를 그대로 문항 순서로 쓴다. 난이도가 오름차순이어야
    // "어디서부터 틀리기 시작했는지"로 레벨을 추천할 수 있다.
    const questions = LEVELS.flatMap((level) => {
      const row = (data ?? []).find((item) => item.level === level.title);

      if (!row) return [];

      // answer는 정답 보기의 텍스트라 option_1~4와 대조해 몇 번째인지(0-based)를 서버가 계산한다.
      const options = shuffle([row.option_1, row.option_2, row.option_3, row.option_4]);
      const correctIndex = options.findIndex((option) => option === row.answer);

      // 보기 어디에도 없는 answer는 채점이 불가능하다. 그 문항만 빼고 나머지로 테스트를 진행한다.
      if (correctIndex === -1) {
        console.error(`[level-test] 정답과 보기가 불일치: question_id=${row.id}`);

        return [];
      }

      return [{ id: row.id, step: level.step, prompt: row.content, options, correctIndex }];
    });

    if (questions.length === 0) throw new ApiError(404, '레벨 테스트 문제가 없습니다.');

    const { body, status } = toSuccessResult(LevelTestQuestionListSchema, questions);

    return NextResponse.json(body, { status });
  } catch (error) {
    const { body, status } = toErrorResult(error);

    return NextResponse.json(body, { status });
  }
}
