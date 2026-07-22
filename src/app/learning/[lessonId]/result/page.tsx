import { QuizAvatarRing } from '@/components/common/AvatarRing';
import { CoinBadge } from '@/components/common/CoinBadge';
import { SpeechBubble } from '@/components/common/SpeechBubble';
import { HappinessGauge } from '@/components/quiz/HappinessGauge';
import { QuizResultActions } from '@/components/quiz/QuizResultActions';
import { QuizResultStats } from '@/components/quiz/QuizResultStats';
import { QuizXpBadge } from '@/components/quiz/QuizXpBadge';
import { DEFAULT_CHARACTER_TYPE, DEFAULT_COLOR_THEME } from '@/constants/avatar';
import { CURRICULUM_TOTAL_COUNT } from '@/constants/curriculum';
import { moodFromValue } from '@/constants/mood';
import { QUIZ_FAILURE_DIALOGUE, QUIZ_SUCCESS_DIALOGUE } from '@/constants/quiz-dialogue';
import { createClient } from '@/lib/supabase/server';
import type { CharacterType, ColorTheme } from '@/types/avatar';

// XP·코인·행복도 증가분은 서버가 이미 계산한 값(첫 클리어 판정 포함)을 쿼리로 받아 그대로 표시만 한다.
const DEFAULT_MOOD_VALUE = 60;

// 음수/문자열 등 잘못된 쿼리값이 와도 0으로 안전하게 처리한다.
function parseCount(value: string | undefined): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : 0;
}

// 서버 컴포넌트라 요청마다 한 번만 실행되고 그대로 HTML에 구워지므로, 무작위 선택도
// 클라이언트 재실행에 따른 하이드레이션 불일치 없이 안전하다.
function pickDialogue(lines: readonly string[]): string {
  return lines[Math.floor(Math.random() * lines.length)];
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
    const dialogue = pickDialogue(QUIZ_FAILURE_DIALOGUE[mood]);
    const totalCount = correctCount + wrongCount;

    return (
      <>
        <div className="flex justify-center">
          <SpeechBubble size="md">{dialogue}</SpeechBubble>
        </div>
        <QuizAvatarRing
          size={200}
          happinessPercent={happinessPercent}
          gainPercent={gainPercent}
          characterType={characterType}
          colorTheme={colorTheme}
          useHero
          mood={mood}
        />
        <p className="text-brown-soft text-center text-sm">
          {totalCount}문제를 모두 맞혀야 다음 스테이지로 넘어갈 수 있어요
        </p>
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

  const successDialogue = pickDialogue(QUIZ_SUCCESS_DIALOGUE[mood]);

  return (
    <>
      <div className="flex justify-center">
        <SpeechBubble size="md">{successDialogue}</SpeechBubble>
      </div>
      <QuizAvatarRing
        size={200}
        happinessPercent={happinessPercent}
        gainPercent={gainPercent}
        characterType={characterType}
        colorTheme={colorTheme}
        useHero
        mood={mood}
      />
      {/* 레이아웃의 기본 gap-8이 위 아바타 링과 너무 벌어져 보여서, "오늘의 클리어" 제목이
          있던 자리만큼(-mt-6) 당겨 아바타 바로 아래 보상처럼 붙인다. */}
      <div className="-mt-6 flex items-center justify-center gap-2">
        {xpReward > 0 && <QuizXpBadge xp={xpReward} />}
        {coinReward > 0 && <CoinBadge amount={coinReward} />}
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
