'use client';

import { useEffect } from 'react';

import { Howl } from 'howler';

import { BGM_SOUND, BGM_VOLUME } from '@/constants/sounds';
import { useBgmStore } from '@/stores/bgm-store';

// 앱 전역에 하나만 마운트되는 배경음악 컨트롤러(providers.tsx). 화면을 이동해도 언마운트되지 않아
// 음악이 끊기지 않는다. 눈에 보이는 요소는 없다(null 렌더).
export function BgmController() {
  const isBgmEnabled = useBgmStore((state) => state.isBgmEnabled);

  useEffect(() => {
    if (!isBgmEnabled) return;

    // Howl 생성은 클라이언트 전용이라 effect 안에서 한다(SSR 안전). loop로 90초 트랙을 계속 돌린다.
    // html5: true — 긴 파일은 전체 디코드를 기다리지 않고 스트리밍 재생한다.
    const bgm = new Howl({ src: [BGM_SOUND], loop: true, volume: BGM_VOLUME, html5: true });

    // 이미 재생 중일 때 play()를 또 부르면 Howl이 소리를 하나 더 얹어 두 트랙이 겹친다. 항상 이걸 거친다.
    const play = () => {
      if (!bgm.playing()) bgm.play();
    };

    // 브라우저 autoplay 정책상 사용자 제스처(첫 클릭/탭/키입력) 전에는 play()가 막힌다.
    // 설정에서 방금 토글을 켠 경우엔 그 클릭이 제스처라 여기서 바로 난다.
    play();

    // 막히면 Howler가 playerror를 낸다. Howler는 자체 autoUnlock으로 첫 제스처를 기다렸다가
    // unlock을 내보내므로 그 시점에 다시 시도한다(재방문·새로고침으로 켜짐 상태만 복원된 경우).
    // playerror를 once가 아니라 on으로 거는 이유: 재시도가 또 막히면 unlock 대기를 다시 걸어야
    // 하는데, once면 그 한 번으로 소진돼 복구 경로가 사라진다.
    bgm.on('playerror', () => {
      bgm.once('unlock', play);
    });

    return () => {
      // 끄면(또는 언마운트) 핸들러를 떼고 재생을 멈춘다. 다시 켜면 새 Howl로 시작한다.
      bgm.off();
      bgm.unload();
    };
  }, [isBgmEnabled]);

  return null;
}
