import { cn } from '@/lib/cn';

interface AvatarBackdropProps {
  className?: string;
}

// 아바타 카드 배경. 게임풍 숲 일러스트(래스터 에셋)를 카드 전체에 깐다.
// 손 SVG로는 이 퀄이 안 나오므로 이미지 에셋을 쓴다(캐릭터 아트와 동일한 결론).
// 이미지는 CSS 배경으로 깔아 파일이 없거나 404여도 아래 초록 그라데이션으로 자연 폴백된다.
// 에셋 위치: public/images/avatar/forest-bg.png (라이선스 확인 대상).
export function AvatarBackdrop({ className }: AvatarBackdropProps) {
  return (
    <div
      className={cn(
        'absolute inset-0 overflow-hidden bg-gradient-to-b from-emerald-100 to-emerald-300',
        className,
      )}
      aria-hidden
    >
      {/* 숲 배경 이미지 — 있으면 그라데이션 위를 덮고, 없으면(404) 그라데이션이 그대로 보인다 */}
      <div className="absolute inset-0 bg-[url('/images/avatar/forest-bg.png')] bg-cover bg-center" />

      {/* 가독성용 오버레이 — 번잡한 숲 위에서 캐릭터·이름표가 뜨도록 위/아래를 살짝 대비 */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/10" />
    </div>
  );
}
