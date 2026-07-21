import { Angry, BatteryLow, Frown, Meh, Smile, type LucideIcon } from 'lucide-react';

import { DEFAULT_MOOD } from '@/constants/avatar';
import type { Mood } from '@/types/mypage/model';

export const MOOD_ICON: Record<Mood, LucideIcon> = {
  행복: Smile,
  보통: Meh,
  우울: Frown,
  지침: BatteryLow,
  화남: Angry,
};

// 서버 avatar_status.mood_value(0~100 정수) → Mood 5단계 매핑.
//
// 결정(2026-07-13, #42): DB는 감정을 mood_value 정수 하나로만 주고, 프론트에서 20폭씩
// 균등 5등분한다(0-20 화남 / 20-40 지침 / 40-60 우울 / 60-80 보통 / 80-100 행복).
// 이 함수가 숫자→Mood 변환의 유일한 출처다 — avatar_status 조회 훅이 준비되면
// 응답을 이 함수에 통과시켜 store/컴포넌트에 Mood 문자열로 넘긴다(소비처는 그대로).
//
// ⚠️ 주의: 앱의 0~100 축은 본래 "행복도"(우울↔행복 1축, HappinessGauge/AvatarRing 참고)라
// 지침·화남은 이 축 위의 "더 낮은 행복"이 아니라 질적으로 다른 감정이다. 즉 화남<지침<우울
// 순서에 행복도상의 의미는 없고, 편의상 저구간에 배치한 것뿐이다. 세밀한 부정 감정 구분이
// 필요해지면 mood_value 단일 스칼라로는 부족하므로 별도 신호(연속 오답·타임아웃·스트릭 끊김 등)로
// 분리해야 한다.
//
// 경계값(20/40/60/80)은 더 행복한(위) 구간으로 올린다 — 예: 80 → 행복, 60 → 보통.
// 하한(이상) 내림차순으로 순회하며 처음 만족하는 구간을 고른다.
const MOOD_THRESHOLDS: readonly [min: number, mood: Mood][] = [
  [80, '행복'],
  [60, '보통'],
  [40, '우울'],
  [20, '지침'],
  [0, '화남'],
];

// 범위를 벗어나거나(0 미만·100 초과) NaN이 들어와도 안전하게 폴백한다.
export function moodFromValue(moodValue: number): Mood {
  if (!Number.isFinite(moodValue)) return DEFAULT_MOOD;

  const clamped = Math.min(Math.max(moodValue, 0), 100);
  const band = MOOD_THRESHOLDS.find(([min]) => clamped >= min);

  return band ? band[1] : DEFAULT_MOOD;
}
