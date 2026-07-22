import { CatSvg } from '@/components/avatar/characters/CatSvg';
import { DogSvg } from '@/components/avatar/characters/DogSvg';
import { RabbitSvg } from '@/components/avatar/characters/RabbitSvg';
import { RedPandaSvg } from '@/components/avatar/characters/RedPandaSvg';
import type { CharacterSvgProps } from '@/components/avatar/characters/types';
import type { CharacterType, ThemeRoles } from '@/types/avatar';

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
// - svgMoodAnchors: SVG 렌더 시 감정 심볼 위치. viewBox(0 0 200 200) 기준이라 좌표를 그대로
//   %(=좌표/2)로 환산해 잡는다. Live2D 실루엣과 비율이 달라 live2d.moodAnchors와 값이 다르다.
// - live2d: 있으면 히어로(메인 프리뷰)에서 Live2D로 렌더한다. 없으면 SVG.
export interface CharacterRenderSpec {
  Svg: CharacterSvg;
  svgMoodAnchors: MoodSymbolAnchors;
  // '기본'(무색·원화색) 테마일 때 SVG에 쓸 캐릭터 고유색. SVG는 테마색으로만 칠하게 설계돼(자연색
  // 개념 없음) 기본이면 흰색이 되므로, 각 캐릭터의 원화색을 여기 둔다. Live2D는 텍스처가 원화색이라
  // 이걸 안 쓴다(회색화된 레서판다만 live2d.naturalBody로 처리).
  naturalRoles: ThemeRoles;
  // feetNudge: 발 높이 정렬 보정(캔버스 높이 대비 비율, +는 아래로). 원화마다 캐릭터가 캔버스 내
  // 다른 높이에 그려져 서있는 발 높이가 어긋나는 걸, 레서판다(발 87.5%) 기준으로 맞춘 실측값.
  // naturalBody: '기본'(무색·원화색) 테마일 때 body에 곱할 색. 대부분 원본 컬러 텍스처라 흰색(=곱셈
  // 무효=원화색)이라 생략한다. 레서판다는 텍스처가 회색화돼 있어 원래 색(빨강)을 여기서 넣는다.
  live2d?: {
    modelUrl: string;
    moodAnchors: MoodSymbolAnchors;
    feetNudge?: number;
    naturalBody?: string;
  };
  // 있으면 픽커 썸네일을 이 이미지의 얼굴 크롭으로 렌더한다. 없으면 Svg 썸네일.
  thumbnail?: string;
  // 감정 대사 말풍선의 세로 오프셋(Tailwind translate 클래스). AvatarPreview가 말풍선을 기본
  // translate-y-7(캐릭터 쪽으로 28px 아래)로 붙이는데, 토끼처럼 귀가 캔버스 위쪽(실측 y 8.5%)까지
  // 뻗은 캐릭터는 머리 꼭대기가 ~32px 높아 이 값이면 귀에 바짝 붙어 보인다. 그런 캐릭터만 위로
  // 올리는 보정. 생략 시 AvatarPreview 기본값(translate-y-7)을 쓴다. moodAnchors처럼 Tailwind가
  // 리터럴로 잡도록 완성된 클래스 문자열로 둔다.
  speechBubbleNudge?: string;
}

// 레서판다 원화색(빨강). SVG(naturalRoles.body)와 Live2D(live2d.naturalBody)가 같은 색을 써야 하므로
// 단일 출처로 둔다 — 한쪽만 바꾸면 홈/랭킹 SVG와 히어로 Live2D의 빨강이 어긋난다.
const REDPANDA_BODY = '#E8563A';

// 레서판다는 부위별 색이 준비돼 히어로(메인 프리뷰)를 Live2D로 렌더한다.
// 나머지 종류는 Live2D 모델이 없어 SVG로 렌더하며, Live2D 로드 실패 시에도 SVG로 폴백한다.
export const CHARACTER_REGISTRY: Record<CharacterType, CharacterRenderSpec> = {
  레서판다: {
    Svg: RedPandaSvg,
    // SVG 폴백용(viewBox %): 눈 cy106·눈 cx80/120. 하트 높이(top-45%)에서 머리 가장자리 ~18.5/81.5(귀는 위라 안 걸림).
    svgMoodAnchors: {
      tear: 'top-[58%] left-[59%] w-[7%]',
      vein: 'top-[38%] left-[63%] w-[11%]',
      heartLeft: 'top-[45%] left-[8%] w-[9%]',
      heartRight: 'top-[45%] left-[83%] w-[9%]',
    },
    // 원화색: 레서판다는 붉은 계열(옛 클래식과 동일).
    naturalRoles: { body: REDPANDA_BODY, secondary: '#F0D9CC', accent: '#3D3D3D' },
    // 히어로만 Live2D로 렌더. 로드 실패 시 폴백은 위 Svg를 쓴다.
    live2d: {
      modelUrl: '/live2d/redpanda/menhering.model3.json',
      naturalBody: REDPANDA_BODY, // 텍스처가 회색화돼 있어 무색 테마에서 원래 색(빨강)을 곱한다

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
  토끼: {
    Svg: RabbitSvg,
    // 눈 cy114, 머리 cx100 rx60(좌우 20~80).
    svgMoodAnchors: {
      tear: 'top-[62%] left-[59%] w-[7%]',
      vein: 'top-[42%] left-[63%] w-[11%]',
      heartLeft: 'top-[50%] left-[9%] w-[9%]',
      heartRight: 'top-[50%] left-[82%] w-[9%]',
    },
    // 원화색: 토끼는 분홍 계열.
    naturalRoles: { body: '#F4B8CB', secondary: '#FDEEF3', accent: '#3D3D3D' },
    live2d: {
      modelUrl: '/live2d/rabbit/rabbit.model3.json',
      feetNudge: 0.004, // 실측 발 87.1% → 87.5%

      // 실측(캔버스 %): 실루엣 좌우 29~72.5, y 8.5~87(긴 귀가 위로 뻗어 상단이 높다). 눈 42.5/59.5 ·
      // 눈 y 41~49.5(cy 45.5, 귀 때문에 실루엣 내 눈 위치가 낮다). 하트 높이(43.5%) 실루엣 끝 31.5/68.
      moodAnchors: {
        tear: 'top-[50%] left-[58.5%] w-[7%]',
        vein: 'top-[33%] left-[62%] w-[11%]',
        heartLeft: 'top-[43.5%] left-[20%] w-[9%]',
        heartRight: 'top-[43.5%] left-[70.5%] w-[9%]',
      },
    },
    // 전신 원화(투명 배경). 픽커 CSS(origin-[50%_10%] scale-1.75)가 얼굴로 확대·크롭한다
    // — 레서판다 썸네일과 동일한 전신 구도라 같은 프레이밍이 나온다.
    thumbnail: '/images/avatar/rabbit.png',
    // 긴 귀가 위로 뻗어 머리 꼭대기가 다른 캐릭터보다 높다 → 말풍선을 살짝 위로 올려 귀와 띄운다.
    speechBubbleNudge: 'translate-y-2',
  },
  강아지: {
    Svg: DogSvg,
    // 눈 cy100, 하트 높이(top-43%)에서 머리 가장자리 ~20/80(접힌 귀는 더 아래라 이 높이엔 안 걸림).
    svgMoodAnchors: {
      tear: 'top-[55%] left-[59%] w-[7%]',
      vein: 'top-[35%] left-[63%] w-[11%]',
      heartLeft: 'top-[43%] left-[9%] w-[9%]',
      heartRight: 'top-[43%] left-[82%] w-[9%]',
    },
    // 원화색: 강아지는 탄/베이지 계열.
    naturalRoles: { body: '#E3C39A', secondary: '#F5EDE0', accent: '#3D3D3D' },
    live2d: {
      modelUrl: '/live2d/dog/dog.model3.json',
      feetNudge: 0.037, // 실측 발 83.8% → 87.5%

      // 실측(캔버스 %): 실루엣 좌우 21.5~77.5(고양이보다 넓음). 눈 40.5/59.5 · 눈 y 35.5~43.5(cy 39.5).
      // 하트 높이(37.5%)에서 실루엣 끝 22/77.5. (좌우 눈 대칭 정상)
      moodAnchors: {
        tear: 'top-[44%] left-[58.5%] w-[7%]',
        vein: 'top-[27.5%] left-[62%] w-[11%]',
        heartLeft: 'top-[37.5%] left-[10.5%] w-[9%]',
        heartRight: 'top-[37.5%] left-[80%] w-[9%]',
      },
    },
    thumbnail: '/images/avatar/dog.png',
  },
  고양이: {
    Svg: CatSvg,
    // 눈 cy108 ry11, 머리 cx100 rx60(좌우 20~80).
    svgMoodAnchors: {
      tear: 'top-[60%] left-[59%] w-[7%]',
      vein: 'top-[39%] left-[63%] w-[11%]',
      heartLeft: 'top-[47%] left-[9%] w-[9%]',
      heartRight: 'top-[47%] left-[82%] w-[9%]',
    },
    // 원화색: 고양이는 회색 태비 계열.
    naturalRoles: { body: '#9AA0A6', secondary: '#EFEDE7', accent: '#3D3D3D' },
    live2d: {
      modelUrl: '/live2d/cat/cat.model3.json',
      feetNudge: 0.023, // 실측 발 85.2% → 87.5%

      // 실측(캔버스 %): 실루엣 좌우 25.5~75.5(중심 50.5). 눈 42.5/57.5 · 눈 y 37.5~45.5(cy 41.5).
      // 하트 높이(39.5%)에서 실루엣 끝 30/72. (eye_R 드로어블에 stray 정점 있어 eye_L 미러 사용)
      moodAnchors: {
        tear: 'top-[46%] left-[56.5%] w-[7%]',
        vein: 'top-[29.5%] left-[60%] w-[11%]',
        heartLeft: 'top-[39.5%] left-[18.5%] w-[9%]',
        heartRight: 'top-[39.5%] left-[74%] w-[9%]',
      },
    },
    thumbnail: '/images/avatar/cat.png',
  },
};
