import { cn } from '@/lib/cn';

// 색상 테마/캐릭터 선택 카드가 공유하는 선택 상태 스타일.
// 레이아웃(flex 방향·패딩)은 각 사용처에서 추가한다.
export function selectableCardClass(selected: boolean): string {
  // 라이트 고정. TODO: 다크모드 도입 시 카드 배경 `dark:bg-neutral-900`,
  // 비선택 테두리 `dark:border-neutral-800` 추가
  return cn(
    'rounded-2xl border bg-white transition-colors',
    selected ? 'border-coral ring-coral/30 ring-1' : 'border-cream',
  );
}
