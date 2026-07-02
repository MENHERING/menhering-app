// 색상 테마/캐릭터 선택 섹션이 공유하는 제목 + 2열 그리드 스캐폴드.
interface PickerSectionProps {
  title: string;
  headingId: string;
  children: React.ReactNode;
}

export function PickerSection({ title, headingId, children }: PickerSectionProps) {
  return (
    <section aria-labelledby={headingId}>
      {/* TODO: 다크모드 도입 시 제목 `dark:text-neutral-100` */}
      <h2 id={headingId} className="text-ink mb-3 font-bold">
        {title}
      </h2>

      <div className="grid grid-cols-2 gap-3">{children}</div>
    </section>
  );
}
