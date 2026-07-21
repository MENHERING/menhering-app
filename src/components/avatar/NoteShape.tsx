// 기둥+깃발 경로. plum 밑선과 심볼색 윗선이 같은 모양을 겹쳐 그려 외곽선을 만든다(핏줄과 같은 규약).
const STEM = 'M12.8 17.5V4.5c3.4.7 5.6 2.6 6.4 5.6';

/**
 * 보통 감정의 탭 반응 심볼(♪). 보통은 평상시 심볼이 없는 기준선 상태라 MoodSymbol에는 쓰이지 않고,
 * 탭했을 때만 뜬다 — 감정 표시가 아니라 "쓰다듬으니 기분 좋다"는 반응이다.
 *
 * 머리를 마지막에 그려 기둥 밑동을 덮는다(순서를 바꾸면 기둥 끝이 머리 위로 삐져나온다).
 */
export function NoteShape() {
  return (
    <svg viewBox="0 0 24 24" className="size-full" aria-hidden focusable="false">
      <path
        d={STEM}
        className="stroke-plum"
        strokeWidth={5.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d={STEM}
        className="stroke-music-note"
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <ellipse
        cx="8.6"
        cy="17.8"
        rx="4.6"
        ry="3.5"
        transform="rotate(-18 8.6 17.8)"
        className="fill-music-note stroke-plum"
        strokeWidth={2.2}
      />
    </svg>
  );
}
