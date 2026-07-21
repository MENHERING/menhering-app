/**
 * 우울 감정의 눈물방울. 평상시 심볼(MoodSymbol)과 탭 반응(Live2DCharacter) 양쪽에서 쓴다.
 *
 * 애니메이션·위치는 호출부의 감싸는 span이 담당하고, 여기서는 도형만 그린다
 * (평상시엔 볼을 타고 흐르고, 탭 반응에선 위로 떠오르기 때문에 움직임이 서로 다르다).
 */
export function TearShape() {
  return (
    <svg viewBox="0 0 24 32" className="size-full" aria-hidden focusable="false">
      <path
        d="M12 1.5C12 1.5 3.5 15 3.5 20.5a8.5 8.5 0 0 0 17 0C20.5 15 12 1.5 12 1.5Z"
        className="fill-tear stroke-plum"
        strokeWidth={2.4}
        strokeLinejoin="round"
      />
      {/* 물방울 하이라이트 — 유리질 느낌을 줘 평평한 도형으로 안 보이게 한다. */}
      <ellipse cx="8.8" cy="20.5" rx="1.9" ry="3.1" className="fill-white/80" />
    </svg>
  );
}
