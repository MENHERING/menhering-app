// 인터랙션 효과음 경로(public/sounds/). 라이선스: Mixkit Free License.
// 쓰다듬기(탭)=pop-2, 카드/선택지 선택(터치)=pop.
// TODO: 아바타 밖(온보딩 레벨·선택지)에서도 쓰게 되어 이름이 실제 용도보다 좁다.
// 학습·결과 화면 음원(correct/wrong/complete/coin)을 추가할 때 AVATAR_ 접두사를 걷어낼 것.
export const AVATAR_TAP_SOUND = '/sounds/avatar-pop-2.wav';
export const AVATAR_SELECT_SOUND = '/sounds/avatar-pop.wav';

// 효과음 공용 볼륨(0~1). 탭·선택 모두 동일하게 낮춰 쓴다.
export const AVATAR_SFX_VOLUME = 0.1;

// 효과음 on/off 저장 키(localStorage). 값은 zustand persist가 관리한다.
export const SFX_STORAGE_KEY = 'menhering-sfx';

// 학습 효과음. 문항 채점(정답/오답)과 스테이지 결과(클리어/실패)에 쓴다.
export const QUIZ_CORRECT_SOUND = '/sounds/quiz-correct.mp3';
export const QUIZ_WRONG_SOUND = '/sounds/quiz-wrong.mp3';
export const QUIZ_COMPLETE_SOUND = '/sounds/quiz-complete.mp3';
export const QUIZ_FAIL_SOUND = '/sounds/quiz-fail.mp3';
