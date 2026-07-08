import { HappinessGauge } from '@/components/quiz/HappinessGauge';
import { QuizAvatarRing } from '@/components/quiz/QuizAvatarRing';
import { QuizResultActions } from '@/components/quiz/QuizResultActions';
import { QuizResultStats } from '@/components/quiz/QuizResultStats';
import { QuizXpBadge } from '@/components/quiz/QuizXpBadge';
import { MOCK_LESSONS } from '@/mocks/lessons';

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
  searchParams: Promise<{ correct?: string; wrong?: string }>;
}) {
  const { lessonId } = await params;
  const { correct, wrong } = await searchParams;
  const correctCount = parseCount(correct);
  const wrongCount = parseCount(wrong);
  const totalCount = correctCount + wrongCount;
  const correctRatio = totalCount > 0 ? correctCount / totalCount : 0;

  // TODO: 실제로는 사용자의 누적 학습량에 따라 서버에서 계산된 행복도(0~100)를 받아와야 한다.
  // 지금은 API가 없어 "이번 퀴즈 정답률"을 임시로 그 값처럼 사용한다.
  // QuizAvatarRing/HappinessGauge는 값의 출처와 무관하게 0~100 숫자만 받으므로,
  // 여기 계산식만 실제 API 값으로 바꾸면 두 컴포넌트는 그대로 재사용할 수 있다.
  const happinessPercent = Math.round(correctRatio * 100);
  // 상승 폭 텍스트("+n%p")는 이번 세션에서 오른 변화량이라 행복도와 별개로 계산한다.
  const gainPercent = Math.round(correctRatio * 40);
  const xpReward = MOCK_LESSONS.find((lesson) => lesson.id === lessonId)?.xpReward ?? 0;

  return (
    <>
      <QuizAvatarRing happinessPercent={happinessPercent} />
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-ink text-xl font-extrabold">오늘의 클리어</h1>
        <QuizXpBadge xp={xpReward} />
      </div>
      <HappinessGauge happinessPercent={happinessPercent} gainPercent={gainPercent} />
      <QuizResultStats correctCount={correctCount} wrongCount={wrongCount} />
      <QuizResultActions wrongCount={wrongCount} />
    </>
  );
}
