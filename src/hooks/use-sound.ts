import { useCallback, useEffect } from 'react';

import { Howl } from 'howler';

// src당 Howl 1개를 모듈 캐시로 공유한다: 같은 파일을 여러 컴포넌트가 각자 디코드하거나
// 재마운트마다 재로드하는 낭비를 막는다. SFX는 세션 동안 유지한다(짧은 파일이라 부담 없음).
const soundCache = new Map<string, Howl>();

function ensureLoaded(src: string): Howl {
  let sound = soundCache.get(src);
  if (!sound) {
    sound = new Howl({ src: [src], preload: true });
    soundCache.set(src, sound);
  }

  return sound;
}

// 효과음 재생 훅. 반환된 play는 연타 시 처음부터 다시 재생(interrupt)하고,
// 볼륨은 재생마다 반영해 볼륨이 바뀌어도 Howl을 재생성하지 않는다.
export function useSound(src: string, volume = 0.5) {
  // 마운트 시 미리 로드(preload)한다. lazy 생성(첫 재생 때 new Howl + play)이면 그 시점에
  // .wav 로드·디코드가 끝나야 소리가 나는데, 그 완료 콜백이 무거운 메인스레드 작업(Live2D
  // 리틴트/렌더) 뒤로 밀려 "동작이 끝난 뒤에야" 소리가 들린다. 미리 로드하면 클릭 시 즉시 재생된다.
  // (Howl 생성은 클라이언트 전용이라 effect에서 실행 → SSR 안전)
  useEffect(() => {
    ensureLoaded(src);
  }, [src]);

  return useCallback(() => {
    // 정상 경로에선 위 effect가 이미 로드해둠. 극초반(effect 실행 전) 클릭 대비 fallback 생성.
    const sound = ensureLoaded(src);
    sound.volume(volume);
    sound.stop();
    sound.play();
  }, [src, volume]);
}
