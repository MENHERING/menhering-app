import { cn } from '@/lib/cn';

interface RoadPathProps {
  // 'right-to-left'가 기본 도형이며, 'left-to-right'는 좌우 반전으로 재사용한다.
  direction: 'right-to-left' | 'left-to-right';
}

const WIDTH = 168;
const HEIGHT = 48;
const PATH = `M 148 0 C 148 24, 20 24, 20 ${HEIGHT}`;

export function RoadPath({ direction }: RoadPathProps) {
  // 부모 노드가 좌우로 밀려있는 만큼(±64px, LessonRoadmap의 OFFSET_X와 동일) 역보정해서
  // 경로의 중심을 로드맵 중앙선에 맞춘다.
  const centerXClass =
    direction === 'right-to-left'
      ? 'translate-x-[calc(-50%-64px)]'
      : 'translate-x-[calc(-50%+64px)]';

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
