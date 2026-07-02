import { NODE_OFFSET_PX } from '@/app/learning/_components/roadmap-layout';

interface RoadPathProps {
  // 'left-to-right'는 기본 도형을 좌우 반전해서 재사용한다.
  direction: 'right-to-left' | 'left-to-right';
}

const WIDTH = 184;
const HEIGHT = 80;
const PATH = `M 164 0 C 164 40, 20 40, 20 ${HEIGHT}`;

export function RoadPath({ direction }: RoadPathProps) {
  // 부모 노드의 ±NODE_OFFSET_PX 오프셋을 역보정해 경로를 중앙선에 맞추고,
  // 'left-to-right'는 좌우 반전으로 재사용한다. (rotate/scale과 함께 쓰려면
  // Tailwind arbitrary 클래스로는 상수를 참조할 수 없어 style로 계산한다.)
  const offset = direction === 'right-to-left' ? -NODE_OFFSET_PX : NODE_OFFSET_PX;
  const scaleX = direction === 'left-to-right' ? -1 : 1;

  return (
    <svg
      aria-hidden
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="absolute top-20 left-1/2 overflow-visible"
      style={{ transform: `translateX(calc(-50% + ${offset}px)) scaleX(${scaleX})` }}
    >
      <path d={PATH} stroke="var(--cream)" strokeWidth={30} strokeLinecap="round" fill="none" />
      <path
        d={PATH}
        stroke="white"
        strokeWidth={6}
        strokeDasharray="1 15"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
