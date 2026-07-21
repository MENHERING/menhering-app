// 💢 핏줄을 이루는 안쪽 향 V 네 개. plum 밑선과 vein 윗선이 같은 모양을 겹쳐 그린다.
const VEIN_MARKS = [
  'M8 4.5 12 9.5 16 4.5',
  'M8 19.5 12 14.5 16 19.5',
  'M4.5 8 9.5 12 4.5 16',
  'M19.5 8 14.5 12 19.5 16',
];

/**
 * 화남 감정의 관자놀이 핏줄. 평상시 심볼(MoodSymbol)과 탭 반응(Live2DCharacter) 양쪽에서 쓴다.
 *
 * 빨간 털 위에 빨간 핏줄이라 그냥 두면 묻힌다 → plum 밑선을 먼저 굵게 깔아 외곽선을 만든다
 * (눈물의 stroke-plum과 같은 규약). 테마색이 바뀌어도 읽힌다.
 */
export function VeinShape() {
  return (
    <svg viewBox="0 0 24 24" className="size-full" aria-hidden focusable="false">
      <g
        className="stroke-plum"
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {VEIN_MARKS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <g
        className="stroke-vein"
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {VEIN_MARKS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    </svg>
  );
}
