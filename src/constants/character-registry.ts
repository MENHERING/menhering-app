import { CatSvg } from '@/components/avatar/characters/CatSvg';
import { DogSvg } from '@/components/avatar/characters/DogSvg';
import { RabbitSvg } from '@/components/avatar/characters/RabbitSvg';
import { RedPandaSvg } from '@/components/avatar/characters/RedPandaSvg';
import type { CharacterSvgProps } from '@/components/avatar/characters/types';
import type { CharacterType } from '@/types/avatar';

type CharacterSvg = (props: CharacterSvgProps) => React.ReactElement;

// 캐릭터별 렌더 방식의 단일 출처.
// - Svg: 항상 존재. 픽커 썸네일·홈/마이페이지 재사용·Live2D 폴백에 쓰는 벡터 렌더.
// - live2d: 있으면 히어로(메인 프리뷰)에서 Live2D로 렌더한다. 없으면 SVG.
export interface CharacterRenderSpec {
  Svg: CharacterSvg;
  live2d?: { modelUrl: string };
}

// 레서판다는 부위별 색이 준비돼 히어로(메인 프리뷰)를 Live2D로 렌더한다.
// 나머지 종류는 Live2D 모델이 없어 SVG로 렌더하며, Live2D 로드 실패 시에도 SVG로 폴백한다.
export const CHARACTER_REGISTRY: Record<CharacterType, CharacterRenderSpec> = {
  레서판다: {
    Svg: RedPandaSvg,
    // 히어로만 Live2D로 렌더. 픽커 썸네일·폴백은 위 Svg를 그대로 쓴다.
    live2d: { modelUrl: '/live2d/redpanda/menhering.model3.json' },
  },
  토끼: { Svg: RabbitSvg },
  강아지: { Svg: DogSvg },
  고양이: { Svg: CatSvg },
};
