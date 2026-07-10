import type { Mood } from '@/types/mypage/model';

// 감정 상태(Mood) → Live2D 표정 파라미터 목표값.
// 값은 Cubism 표준 파라미터 규약에 맞춘 정규화 범위이며, 실제 반영은 Live2DCharacter가
// 매 프레임 현재값에서 목표값으로 부드럽게 보간(lerp)해 얹는다. 깜빡임·흔들림 idle 모션과
// 공존하도록, eyeOpen은 자동 깜빡임과 "곱해지는" 베이스 눈뜸 정도로 쓴다.
//
// redpanda moc3 리깅 상태(2026-07-10 /live2d-poc 768px 실측): 입(Form/OpenY)·눈웃음(Smile)·
// 볼(Cheek) 키폼 정상 반영됨.
//
// ⚠️ eyeOpen은 전 감정 1 고정이다. 이 모델의 EyeOpen 키폼이 0(닫힘)↔1(뜸) 2점뿐이라 그 사이가
// 직선 보간인데, 닫힘 형태가 "아래로 휜 크레센트"라 1 미만으로 내리면 윗눈꺼풀이 눈 위에 검은
// 아치로 얹혀 졸린 눈이 아니라 속눈썹처럼 읽힌다(0.7 옅게, 0.6 뚜렷). 완전 붕괴는 ~0.55 아래지만
// 그 위에서도 이 아티팩트가 나오므로 눈은 감정 채널로 쓰지 않는다. 되살리려면 Cubism에서
// EyeOpen 0.5 지점에 반개 키폼(윗눈꺼풀 절반 내림, 동공 보이게)을 추가해야 한다.
// 필드·곱셈 배선은 그대로 두므로 키폼이 붙는 순간 값만 내리면 동작한다.
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
  // 지침 vs 우울은 입 벌림(힘없이 살짝 벌린 입)과 눈썹 처짐 정도로만 갈린다. 졸린 눈은
  // 반개 키폼이 붙어야 가능하다.
  지침: {
    mouthForm: -0.25,
    mouthOpen: 0.1,
    eyeOpen: 1,
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
