import { HappinessGauge } from '@/components/quiz/HappinessGauge';
import { QuizAvatarRing } from '@/components/quiz/QuizAvatarRing';
import { QuizResultActions } from '@/components/quiz/QuizResultActions';
import { QuizResultStats } from '@/components/quiz/QuizResultStats';

// 음수/문자열 등 잘못된 쿼리값이 와도 0으로 안전하게 처리한다.
function parseCount(value: string | undefined): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : 0;
}

export default async function QuizResultPage({
  searchParams,
}: {
  searchParams: Promise<{ correct?: string; wrong?: string }>;
}) {
  const { correct, wrong } = await searchParams;
  const correctCount = parseCount(correct);
  const wrongCount = parseCount(wrong);
  const totalCount = correctCount + wrongCount;
  const correctRatio = totalCount > 0 ? correctCount / totalCount : 0;
  // 행복도(링 색상)는 정답 비율(0~100), 상승 폭 텍스트는 임시 계산식(정답 비율 * 40%p).
  // 실제 산정 로직은 후속 이슈.
  const happinessPercent = Math.round(correctRatio * 100);
  const gainPercent = Math.round(correctRatio * 40);

  return (
    <>
      <QuizAvatarRing size={200} happinessPercent={happinessPercent} />
      <h1 className="text-ink text-center text-xl font-extrabold">오늘의 클리어</h1>
      <HappinessGauge gainPercent={gainPercent} />
      <QuizResultStats correctCount={correctCount} wrongCount={wrongCount} />
      <QuizResultActions />
    </>
  );
}
