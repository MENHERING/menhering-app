import { CatSvg } from '@/components/avatar/characters/CatSvg';
import { DogSvg } from '@/components/avatar/characters/DogSvg';
import { RabbitSvg } from '@/components/avatar/characters/RabbitSvg';
import { RedPandaSvg } from '@/components/avatar/characters/RedPandaSvg';
import type { CharacterSvgProps } from '@/components/avatar/characters/types';
import type { CharacterType } from '@/types/avatar';

type CharacterSvg = (props: CharacterSvgProps) => React.ReactElement;

/**
 * 감정 심볼(MoodSymbol)을 얼굴 어디에 얹을지. 캐릭터마다 실루엣이 달라 모델별로 재야 한다.
 *
 * 값은 좌표 숫자가 아니라 **Tailwind 클래스 문자열**이다 — Tailwind는 소스에 리터럴로 박힌
 * 클래스만 emit하므로 `top-[${n}%]` 같은 동적 조합은 스타일이 안 생기고, 인라인 스타일은
 * 팀 컨벤션상 금지다. 이 파일은 `@source '../**\/*.{ts,tsx}'` 스캔 범위 안이라 그대로 잡힌다.
 *
 * 재는 법: 해당 모델을 /live2d-poc에 띄우고 `gl.readPixels`로 캔버스 백버퍼의 alpha>16 구간에서
 * 실루엣 좌우 끝을 구한다. 캐릭터는 캔버스 중심 대칭이 아니므로(getBounds가 꼬리까지 포함한
 * 콘텐츠 중심을 맞춘다) 눈대중이나 좌우 대칭 가정은 반드시 빗나간다.
 */
export interface MoodSymbolAnchors {
  /** 우울 눈물 — 오른쪽 눈 바깥쪽 바로 아래. */
  tear: string;
  /** 화남 핏줄 — 오른쪽 눈과 귀 사이 관자놀이. */
  vein: string;
  /** 행복 하트 — 얼굴 양옆 배경. 실루엣 가장자리에서 같은 간격만큼 띄운다. */
  heartLeft: string;
  heartRight: string;
}

// 캐릭터별 렌더 방식의 단일 출처.
// - Svg: 항상 존재. 픽커 썸네일·홈/마이페이지 재사용·Live2D 폴백에 쓰는 벡터 렌더.
// - live2d: 있으면 히어로(메인 프리뷰)에서 Live2D로 렌더한다. 없으면 SVG.
export interface CharacterRenderSpec {
  Svg: CharacterSvg;
  live2d?: { modelUrl: string; moodAnchors: MoodSymbolAnchors };
  // 있으면 픽커 썸네일을 이 이미지의 얼굴 크롭으로 렌더한다. 없으면 Svg 썸네일.
  thumbnail?: string;
}

// 레서판다는 부위별 색이 준비돼 히어로(메인 프리뷰)를 Live2D로 렌더한다.
// 나머지 종류는 Live2D 모델이 없어 SVG로 렌더하며, Live2D 로드 실패 시에도 SVG로 폴백한다.
export const CHARACTER_REGISTRY: Record<CharacterType, CharacterRenderSpec> = {
  레서판다: {
    Svg: RedPandaSvg,
    // 히어로만 Live2D로 렌더. 로드 실패 시 폴백은 위 Svg를 쓴다.
    live2d: {
      modelUrl: '/live2d/redpanda/menhering.model3.json',
      // 실측(캔버스 %): 실루엣 좌우 끝은 귀 구간 22.8~75.3, 하트 구간 22.8~74.7(중심 48.8).
      // 코 49.4 · 왼눈 42.5 · 오른눈 56.5 · 정수리 20 · 눈 36~43.
      moodAnchors: {
        tear: 'top-[43.5%] left-[55.5%] w-[7%]',
        vein: 'top-[28%] left-[59%] w-[11%]',
        // 실루엣 가장자리(22.8 / 74.7)에서 각각 2.3% 띄운 값. 캔버스 중심 대칭이 아니다.
        heartLeft: 'top-[37%] left-[11.5%] w-[9%]',
        heartRight: 'top-[37%] left-[77%] w-[9%]',
      },
    },
    // 픽커 썸네일은 실제 캐릭터 아트(투명 배경)의 얼굴 크롭.
    thumbnail: '/images/avatar/menhering_1_img.webp',
  },
  토끼: { Svg: RabbitSvg },
  강아지: { Svg: DogSvg },
  고양이: { Svg: CatSvg },
};
