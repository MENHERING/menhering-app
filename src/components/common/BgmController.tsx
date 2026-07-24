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

    // 브라우저 autoplay 정책상 사용자 제스처(첫 클릭/탭/키입력) 전에는 play()가 막힌다.
    // 일단 시도하고(설정에서 방금 켠 경우엔 그 클릭 자체가 제스처라 바로 난다), 막혔으면
    // 첫 제스처 때 다시 시작한다(재방문·새로고침으로 켜짐 상태만 복원된 경우).
    bgm.play();

    const resume = () => {
      if (!bgm.playing()) bgm.play();
    };

    // { once: true }: 첫 제스처만 잡고 스스로 제거된다. 이미 재생 중이면 resume은 아무 것도 안 한다.
    document.addEventListener('pointerdown', resume, { once: true });
    document.addEventListener('keydown', resume, { once: true });

    return () => {
      document.removeEventListener('pointerdown', resume);
      document.removeEventListener('keydown', resume);
      // 끄면(또는 언마운트) 재생을 멈추고 리소스를 해제한다. 다시 켜면 새 Howl로 시작한다.
      bgm.unload();
    };
  }, [isBgmEnabled]);

  return null;
}
