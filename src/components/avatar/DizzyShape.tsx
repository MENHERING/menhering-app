// 안에서 밖으로 감겨 나오는 소용돌이. plum 밑선과 심볼색 윗선이 같은 모양을 겹쳐 그린다(핏줄과 같은 규약).
const SPIRAL = 'M12 12.6a1.9 1.9 0 1 1 2.7 1.7 3.6 3.6 0 1 1-4.7-3.2 5.6 5.6 0 1 1 7 5.2';

/**
 * 지침 감정의 탭 반응 심볼(뺑글뺑글). 지침은 평상시 심볼 대신 배경 세로 해칭(MoodBackdrop)이
 * 감정을 담당하므로 MoodSymbol에는 쓰이지 않고, 탭했을 때만 뜬다.
 *
 * 채움색을 배경 해칭(--aura-ink)과 같은 무채색 계열(--dizzy)로 맞춘다 — 지침에서 유채색 심볼이
 * 뜨면 무채색 기운과 따로 놀아 "지쳤다"는 인상이 깨진다.
 */
export function DizzyShape() {
  return (
    <svg viewBox="0 0 24 24" className="size-full" aria-hidden focusable="false">
      <path d={SPIRAL} className="stroke-plum" strokeWidth={5} strokeLinecap="round" fill="none" />
      <path
        d={SPIRAL}
        className="stroke-dizzy"
        strokeWidth={2.6}
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
