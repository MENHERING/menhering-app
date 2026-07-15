import { HappinessGauge } from '@/components/quiz/HappinessGauge';
import { QuizAvatarRing } from '@/components/quiz/QuizAvatarRing';
import { QuizResultActions } from '@/components/quiz/QuizResultActions';
import { QuizResultStats } from '@/components/quiz/QuizResultStats';
import { QuizXpBadge } from '@/components/quiz/QuizXpBadge';
import { CURRICULUM_TOTAL_COUNT } from '@/constants/curriculum';
import { createClient } from '@/lib/supabase/server';

// submit_quiz_result RPC와 동일한 값(정답 1개당 XP·행복도 증가폭)을 화면 표시에도 그대로 쓴다.
const XP_PER_CORRECT = 10;
const MOOD_GAIN_PER_CORRECT = 2;
const DEFAULT_MOOD_VALUE = 60;

// 음수/문자열 등 잘못된 쿼리값이 와도 0으로 안전하게 처리한다.
function parseCount(value: string | undefined): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : 0;
}

export default async function QuizResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ lessonId: string }>;
  searchParams: Promise<{
    correct?: string;
    wrong?: string;
    level?: string;
    stage?: string;
    success?: string;
  }>;
}) {
  const { lessonId } = await params;
  const { correct, wrong, level, stage, success } = await searchParams;
  const correctCount = parseCount(correct);
  const wrongCount = parseCount(wrong);
  const isSuccess = success === 'true';

  // "다음 스테이지" 버튼의 실제 목적지. 방금 푼 레벨의 마지막 스테이지였으면 다음 스테이지가 없다.
  const stageNumber = Number(stage);
  const nextLessonId =
    level && Number.isInteger(stageNumber) && stageNumber < (CURRICULUM_TOTAL_COUNT[level] ?? 0)
      ? `${level}-${stageNumber + 1}`
      : null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 방금 submit_quiz_result가 이미 갱신을 마친 뒤라, 현재 행복도를 그대로 조회해서 보여준다.
  let happinessPercent = DEFAULT_MOOD_VALUE;
  if (user) {
    const { data: avatar } = await supabase
      .from('avatars')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (avatar) {
      const { data: status } = await supabase
        .from('avatar_status')
        .select('mood_value')
        .eq('avatar_id', avatar.id)
        .maybeSingle();

      happinessPercent = status?.mood_value ?? DEFAULT_MOOD_VALUE;
    }
  }

  const gainPercent = correctCount * MOOD_GAIN_PER_CORRECT;
  const xpReward = correctCount * XP_PER_CORRECT;

  if (!isSuccess) {
    return (
      <>
        <QuizAvatarRing happinessPercent={happinessPercent} />
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-ink text-xl font-extrabold">아쉬워요!</h1>
          <p className="text-brown-soft text-sm">오답이 너무 많아 스테이지를 통과하지 못했어요</p>
        </div>
        <QuizResultStats correctCount={correctCount} wrongCount={wrongCount} />
        <QuizResultActions
          isSuccess={false}
          wrongCount={wrongCount}
          nextLessonId={nextLessonId}
          level={level ?? ''}
          lessonId={lessonId}
        />
      </>
    );
  }

  return (
    <>
      <QuizAvatarRing happinessPercent={happinessPercent} />
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-ink text-xl font-extrabold">오늘의 클리어</h1>
        <QuizXpBadge xp={xpReward} />
      </div>
      <HappinessGauge happinessPercent={happinessPercent} gainPercent={gainPercent} />
      <QuizResultStats correctCount={correctCount} wrongCount={wrongCount} />
      <QuizResultActions
        isSuccess
        wrongCount={wrongCount}
        nextLessonId={nextLessonId}
        level={level ?? ''}
        lessonId={lessonId}
      />
    </>
  );
}
