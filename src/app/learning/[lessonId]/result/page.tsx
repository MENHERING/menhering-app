import { QuizAvatarRing } from '@/components/common/AvatarRing';
import { CoinBadge } from '@/components/common/CoinBadge';
import { HappinessGauge } from '@/components/quiz/HappinessGauge';
import { QuizResultActions } from '@/components/quiz/QuizResultActions';
import { QuizResultStats } from '@/components/quiz/QuizResultStats';
import { QuizXpBadge } from '@/components/quiz/QuizXpBadge';
import { DEFAULT_CHARACTER_TYPE, DEFAULT_COLOR_THEME } from '@/constants/avatar';
import { CURRICULUM_TOTAL_COUNT } from '@/constants/curriculum';
import { moodFromValue } from '@/constants/mood';
import { createClient } from '@/lib/supabase/server';
import type { CharacterType, ColorTheme } from '@/types/avatar';

// XP·코인·행복도 증가분은 서버가 이미 계산한 값(첫 클리어 판정 포함)을 쿼리로 받아 그대로 표시만 한다.
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
    xp?: string;
    coin?: string;
    moodGain?: string;
  }>;
}) {
  const { lessonId } = await params;
  const { correct, wrong, level, stage, success, xp, coin, moodGain } = await searchParams;
  const correctCount = parseCount(correct);
  const wrongCount = parseCount(wrong);
  const isSuccess = success === 'true';
  const xpReward = parseCount(xp);
  const coinReward = parseCount(coin);
  const gainPercent = parseCount(moodGain);

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
  // get_avatar_status RPC로 조회해야 마지막 정산 이후 경과분(감쇠)까지 반영된 값이 나온다 —
  // avatar_status 테이블을 직접 읽으면 아바타 탭을 열어야만 갱신되는 감쇠 전 값이 보일 수 있다.
  let happinessPercent = DEFAULT_MOOD_VALUE;
  let characterType: CharacterType = DEFAULT_CHARACTER_TYPE;
  let colorTheme: ColorTheme = DEFAULT_COLOR_THEME;
  if (user) {
    const [{ data: avatar }, { data: status }] = await Promise.all([
      supabase
        .from('avatars')
        .select('character_type, color_theme')
        .eq('user_id', user.id)
        .maybeSingle(),
      supabase.rpc('get_avatar_status').maybeSingle<{ mood_value: number }>(),
    ]);

    if (avatar) {
      characterType = (avatar.character_type as CharacterType) ?? DEFAULT_CHARACTER_TYPE;
      colorTheme = (avatar.color_theme as ColorTheme) ?? DEFAULT_COLOR_THEME;
    }

    happinessPercent = status?.mood_value ?? DEFAULT_MOOD_VALUE;
  }

  const mood = moodFromValue(happinessPercent);

  if (!isSuccess) {
    return (
      <>
        <QuizAvatarRing
          happinessPercent={happinessPercent}
          characterType={characterType}
          colorTheme={colorTheme}
          useHero
          mood={mood}
        />
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-ink text-xl font-extrabold">아쉬워요!</h1>
          <p className="text-brown-soft text-sm">이번 스테이지는 통과하지 못했어요</p>
        </div>
        <QuizResultStats correctCount={correctCount} wrongCount={wrongCount} />
        <QuizResultActions
          isSuccess={false}
          isFirstClear={xpReward > 0}
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
      <QuizAvatarRing
        happinessPercent={happinessPercent}
        characterType={characterType}
        colorTheme={colorTheme}
        useHero
        mood={mood}
      />
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-ink text-xl font-extrabold">오늘의 클리어</h1>
        <div className="flex items-center gap-2">
          <QuizXpBadge xp={xpReward} />
          {coinReward > 0 && <CoinBadge amount={coinReward} />}
        </div>
      </div>
      <HappinessGauge happinessPercent={happinessPercent} gainPercent={gainPercent} />
      <QuizResultStats correctCount={correctCount} wrongCount={wrongCount} />
      <QuizResultActions
        isSuccess
        isFirstClear={xpReward > 0}
        wrongCount={wrongCount}
        nextLessonId={nextLessonId}
        level={level ?? ''}
        lessonId={lessonId}
      />
    </>
  );
}
