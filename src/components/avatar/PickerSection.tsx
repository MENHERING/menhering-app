import { CoinBadge } from '@/components/common/CoinBadge';

// 색상 테마/캐릭터 선택 섹션이 공유하는 제목 + 2열 그리드 스캐폴드.
interface PickerSectionProps {
  title: string;
  headingId: string;
  // 지정 시 제목 옆에 항목당 구매 코스트 뱃지를 1개 표시(카드마다 달지 않는다).
  cost?: number;
  children: React.ReactNode;
}

export function PickerSection({ title, headingId, cost, children }: PickerSectionProps) {
  return (
    <section aria-labelledby={headingId}>
      <div className="mb-3 flex items-center gap-2">
        {/* TODO: 다크모드 도입 시 제목 `dark:text-neutral-100` */}
        <h2 id={headingId} className="text-ink font-bold">
          {title}
        </h2>
        {cost !== undefined && <CoinBadge amount={cost} size="sm" />}
      </div>

      <div className="grid grid-cols-2 gap-3">{children}</div>
    </section>
  );
}
