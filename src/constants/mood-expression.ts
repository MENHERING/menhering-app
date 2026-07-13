import type { Mood } from '@/types/mypage/model';

// 감정 상태(Mood) → Live2D 표정 파라미터 목표값.
// 값은 Cubism 표준 파라미터 규약에 맞춘 정규화 범위이며, 실제 반영은 Live2DCharacter가
// 매 프레임 현재값에서 목표값으로 부드럽게 보간(lerp)해 얹는다. 깜빡임·흔들림 idle 모션과
// 공존하도록, eyeOpen은 자동 깜빡임과 "곱해지는" 베이스 눈뜸 정도로 쓴다.
//
// redpanda moc3 리깅 상태(2026-07-10 /live2d-poc 768px 실측): 입(Form/OpenY)·눈웃음(Smile)·
// 볼(Cheek) 키폼 정상 반영됨.
//
// eyeOpen은 자동 깜빡임과 곱해지는 베이스 눈뜸(0 감음 ~ 1 활짝)이다. EyeOpen 키폼은 0↔1
// 2점 직선 보간뿐이지만, 1 미만에서 "졸린 눈"으로 자연스럽게 읽힌다 — 예전엔 얼굴 텍스처
// (body_fur)에 감은 눈꺼풀 획이 그려박혀 있어 눈을 반쯤 감으면 그 검은 획이 뒤에서 삐져나와
// 속눈썹처럼 보였는데, 2026-07-13 그 획을 PSD에서 지워 해소했다. 이제 1 미만으로 내려도 깔끔한
// 나른한 눈이라 지침에 쓴다(반개 키폼 리깅 불필요). 단 눈 뒤가 body_fur(이마 주황 털)이라
// 0.8 미만으로 내리면 윗눈꺼풀 자리에서 주황이 드러난다 → 지침은 0.8로 얕게만 내린다.
// 더 깊은 졸린 눈을 원하면 body_fur의 어두운 눈두덩 무늬를 눈 위로 넓혀 칠해야 한다(PSD).
//
// 눈썹 변형(BrowForm)도 키폼은 있으나 눈썹 아트가 작은 대칭 타원이라 八/V 방향감이 약하다.
// ⇒ 얼굴에서 실제로 읽히는 감정 채널은 입 + 볼뿐이다. 우울/지침/화남의 세밀한 구분은
// 만화적 심볼 오버레이(눈물·한숨·핏줄)가 맡는다 — 히어로가 128px이라 미세 표정은 어차피 안 보인다.
//
// ParamBrowL/RAngle은 이 모델에 키폼이 없어(no-op) 아예 다루지 않는다. 나중에 리깅되면
// 필드를 추가하되, 좌우 눈썹이 V자로 모이려면 L/R에 반대 부호를 넣어야 한다(같은 값이면
// 양쪽이 같은 방향으로 기운다).
export interface MoodExpression {
  /** 입 변형. -1 찡그림 ~ 0 무표정 ~ 1 활짝 웃음 (ParamMouthForm) */
  mouthForm: number;
  /** 입 벌림. 0 다묾 ~ 1 벌림 (ParamMouthOpenY) */
  mouthOpen: number;
  /** 베이스 눈뜸. 0 감음(졸림) ~ 1 활짝. 자동 깜빡임과 곱해진다 (ParamEyeL/ROpen).
   *  현재 모델은 반개 키폼이 없어 전 감정 1 고정 — 위 주석 참고. */
  eyeOpen: number;
  /** 웃는 눈. 0 ~ 1 (^^ 눈웃음) (ParamEyeL/RSmile) */
  eyeSmile: number;
  /** 눈썹 상하. -1 처짐 ~ 1 올라감 (ParamBrowL/RY) */
  browY: number;
  /** 눈썹 변형. -1 곤란/슬픔(八자) ~ 1 화남 (ParamBrowL/RForm) */
  browForm: number;
  /** 볼 홍조. 0 ~ 1 (ParamCheek) */
  cheek: number;
}

export const NEUTRAL_EXPRESSION: MoodExpression = {
  mouthForm: 0.15,
  mouthOpen: 0,
  eyeOpen: 1,
  eyeSmile: 0,
  browY: 0,
  browForm: 0,
  cheek: 0,
};

// 매 프레임 보간할 필드 목록. MoodExpression이 전부 number라 키만 알면 일괄 보간된다.
// 상수에서 1회 파생해 필드를 추가해도 보간 루프가 자동으로 따라간다(손으로 나열하면 누락됨).
export const EXPRESSION_KEYS = Object.keys(NEUTRAL_EXPRESSION) as (keyof MoodExpression)[];

export const MOOD_EXPRESSION: Record<Mood, MoodExpression> = {
  행복: {
    mouthForm: 1,
    mouthOpen: 0.35,
    eyeOpen: 1,
    eyeSmile: 0.75,
    browY: 0.2,
    browForm: 0,
    cheek: 0.55,
  },
  보통: NEUTRAL_EXPRESSION,
  우울: {
    mouthForm: -0.75,
    mouthOpen: 0,
    eyeOpen: 1,
    eyeSmile: 0,
    browY: -0.5,
    browForm: -0.7,
    cheek: 0,
  },
  // 지침 vs 우울: 지침은 살짝 나른한 눈(eyeOpen 0.8) + 힘없이 살짝 벌린 입, 우울은 뜬 눈 +
  // 처진 눈썹. 눈 밑으로 더 내릴수록 윗눈꺼풀 자리에서 이마 주황 털이 드러나 눈이 주황빛으로
  // 껴 보인다(눈 뒤가 body_fur라서). 0.8 근처가 주황 최소 + 살짝 처짐의 절충선.
  지침: {
    mouthForm: -0.25,
    mouthOpen: 0.1,
    eyeOpen: 0.8,
    eyeSmile: 0,
    browY: -0.35,
    browForm: -0.3,
    cheek: 0,
  },
  화남: {
    mouthForm: -0.5,
    mouthOpen: 0.15,
    eyeOpen: 1,
    eyeSmile: 0,
    browY: -0.3,
    browForm: 0.85,
    cheek: 0,
  },
};

// 잘못된 값이 들어와도 무표정으로 폴백.
export function getMoodExpression(mood: Mood | undefined): MoodExpression {
  if (!mood) return NEUTRAL_EXPRESSION;
  return MOOD_EXPRESSION[mood] ?? NEUTRAL_EXPRESSION;
}
