import { cn } from '@/lib/cn';

interface RoadPathProps {
  // 'left-to-right'는 기본 도형을 좌우 반전해서 재사용한다.
  direction: 'right-to-left' | 'left-to-right';
}

const WIDTH = 184;
const HEIGHT = 80;
const PATH = `M 164 0 C 164 40, 20 40, 20 ${HEIGHT}`;

export function RoadPath({ direction }: RoadPathProps) {
  // 부모 노드의 ±72px 오프셋(LessonRoadmap의 OFFSET_X)을 역보정해 경로를 중앙선에 맞춘다.
  const centerXClass =
    direction === 'right-to-left'
      ? 'translate-x-[calc(-50%-72px)]'
      : 'translate-x-[calc(-50%+72px)]';

  return (
    <svg
      aria-hidden
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className={cn(
        'absolute top-20 left-1/2 overflow-visible',
        centerXClass,
        direction === 'left-to-right' && 'scale-x-[-1]',
      )}
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
