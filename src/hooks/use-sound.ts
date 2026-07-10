import { useCallback } from 'react';

import { Howl } from 'howler';

// src당 Howl 1개를 모듈 캐시로 공유한다: 같은 파일을 여러 컴포넌트가 각자 디코드하거나
// 재마운트마다 재로드하는 낭비를 막는다. 최초 재생 시점에 생성하므로(재생 안 하면 로드도 안 함)
// SSR에서 실행되지 않고, SFX는 세션 동안 유지한다(짧은 파일이라 부담 없음).
const soundCache = new Map<string, Howl>();

// 효과음 재생 훅. 반환된 play는 연타 시 처음부터 다시 재생(interrupt)하고,
// 볼륨은 재생마다 반영해 볼륨이 바뀌어도 Howl을 재생성하지 않는다.
export function useSound(src: string, volume = 0.5) {
  return useCallback(() => {
    let sound = soundCache.get(src);
    if (!sound) {
      sound = new Howl({ src: [src] });
      soundCache.set(src, sound);
    }
    sound.volume(volume);
    sound.stop();
    sound.play();
  }, [src, volume]);
}
