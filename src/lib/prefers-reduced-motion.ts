// 사용자가 OS/브라우저에서 '동작 줄이기(prefers-reduced-motion)'를 켰는지 여부.
// SSR·구형 환경(window/matchMedia 부재)에서는 false로 방어한다.
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}
