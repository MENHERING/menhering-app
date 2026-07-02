import { cn } from '@/lib/cn';

interface RoadPathProps {
  // 'right-to-left'가 기본 도형이며, 'left-to-right'는 좌우 반전으로 재사용한다.
  direction: 'right-to-left' | 'left-to-right';
}

const WIDTH = 120;
const HEIGHT = 40;
const PATH = `M 100 0 C 100 20, 20 20, 20 ${HEIGHT}`;

export function RoadPath({ direction }: RoadPathProps) {
  // 부모 노드가 좌우로 밀려있는 만큼(±40px) 역보정해서 경로의 중심을 로드맵 중앙선에 맞춘다.
  const centerXClass =
    direction === 'right-to-left'
      ? 'translate-x-[calc(-50%-40px)]'
      : 'translate-x-[calc(-50%+40px)]';

  return (
    <svg
      aria-hidden
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className={cn(
        'absolute top-16 left-1/2',
        centerXClass,
        direction === 'left-to-right' && 'scale-x-[-1]',
      )}
    >
      <path d={PATH} stroke="var(--cream)" strokeWidth={16} strokeLinecap="round" fill="none" />
      <path
        d={PATH}
        stroke="white"
        strokeWidth={3}
        strokeDasharray="1 11"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
