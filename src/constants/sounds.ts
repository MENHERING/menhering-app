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

// 배경음악. 90초 루프. 길어서 wav 대신 mp3(PWA 캐시 부담↓).
// 볼륨은 효과음(AVATAR_SFX_VOLUME=0.1)과 별개 기준이다 — 효과음은 짧게 튀어 낮아도 들리지만,
// BGM은 배경에 깔리는 지속음이라 같은 값이면 거의 안 들린다. 실제 청감으로 맞춘 값이다.
export const BGM_SOUND = '/sounds/bgm-main.mp3';
export const BGM_VOLUME = 0.15;
export const BGM_STORAGE_KEY = 'menhering-bgm';
