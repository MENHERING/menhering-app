interface HeartShapeProps {
  /** SVG 그라데이션 id. 문서 전역이라 인스턴스마다 달라야 한다(호출부가 useId로 생성). */
  gradientId: string;
}

/**
 * 행복 감정 심볼의 하트. 위(밝은 산호빛)→아래(진한 장미빛) 그라데이션이라 단색보다 입체적이다.
 *
 * 그라데이션 id를 밖에서 받는 이유: SVG id는 문서 전역이라 하트가 둘 이상 뜨면 중복된다.
 * 중복 시 모든 `fill=url(#id)`가 문서 순서상 첫 정의로 해석돼, 나중에 색을 인스턴스별로
 * 바꾸는 순간 전부 첫 하트의 색으로 칠해진다.
 */
export function HeartShape({ gradientId }: HeartShapeProps) {
  return (
    <svg viewBox="0 0 24 24" className="size-full" aria-hidden focusable="false">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className="[stop-color:var(--heart-light)]" />
          <stop offset="1" className="[stop-color:var(--heart-deep)]" />
        </linearGradient>
      </defs>
      <path
        d="M12 20.7 3.6 12.3a5 5 0 0 1 7.1-7L12 6.6l1.3-1.3a5 5 0 1 1 7.1 7L12 20.7Z"
        fill={`url(#${gradientId})`}
        className="stroke-plum"
        strokeWidth={2.2}
        strokeLinejoin="round"
      />
    </svg>
  );
}
