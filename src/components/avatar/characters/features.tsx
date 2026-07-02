// 캐릭터 SVG 4종이 공유하는 얼굴 요소. 눈은 항상 cx 80/120 대칭, 흰 하이라이트 고정.
interface EyesProps {
  cy: number;
  rx?: number;
  ry?: number;
  fill: string;
}

export function Eyes({ cy, rx = 9, ry = 10, fill }: EyesProps) {
  return (
    <>
      <ellipse cx={80} cy={cy} rx={rx} ry={ry} fill={fill} />
      <ellipse cx={120} cy={cy} rx={rx} ry={ry} fill={fill} />
      <circle cx={83} cy={cy - 3} r={3} fill="#ffffff" />
      <circle cx={123} cy={cy - 3} r={3} fill="#ffffff" />
    </>
  );
}

// 인중(세로선) + 좌우 대칭 미소. topY=코 아래, bottomY=미소 시작점.
interface MouthProps {
  topY: number;
  bottomY: number;
  width?: number;
  ctrlY?: number;
  stroke: string;
}

export function Mouth({ topY, bottomY, width = 13, ctrlY = 5, stroke }: MouthProps) {
  const ctrlX = Math.round(width * 0.54);

  return (
    <path
      d={`M100 ${topY} V${bottomY} M100 ${bottomY} q-${ctrlX} ${ctrlY} -${width} 1 M100 ${bottomY} q${ctrlX} ${ctrlY} ${width} 1`}
      stroke={stroke}
      strokeWidth={2.5}
      strokeLinecap="round"
      fill="none"
    />
  );
}
