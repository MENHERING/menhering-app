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

// 지금은 전 종류 SVG. 색 리워크(B) 완료 후 레서판다에 live2d를 달아 히어로만 Live2D로 전환(C)한다.
// 모델 자체는 이미 public/live2d/redpanda/에 있으나, 부위별 색(Multiply)이 준비되기 전엔 켜지 않는다.
export const CHARACTER_REGISTRY: Record<CharacterType, CharacterRenderSpec> = {
  레서판다: {
    Svg: RedPandaSvg,
    // 메인 탭은 색 리워크(B) 전까지 SVG 유지 — 전체틴트 임시 색을 탭에 박지 않기로.
    // 우리 Live2D 모델은 /live2d-poc 페이지에서 따로 확인. C에서 아래 활성화.
    // live2d: { modelUrl: '/live2d/redpanda/menhering.model3.json' },
  },
  토끼: { Svg: RabbitSvg },
  강아지: { Svg: DogSvg },
  고양이: { Svg: CatSvg },
};
