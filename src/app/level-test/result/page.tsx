import { LevelResultScreen } from '@/components/intro/LevelResultScreen';

// 온보딩 — 실력테스트 결과·추천 레벨 (step 쿼리로 전달받음)
export default async function LevelTestResultPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string }>;
}) {
  const { step } = await searchParams;
  const parsed = Number(step);
  const recommendedStep =
    Number.isInteger(parsed) && parsed >= 1 && parsed <= 5 ? parsed : undefined;

  return <LevelResultScreen recommendedStep={recommendedStep} />;
}
