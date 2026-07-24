'use client';

import { useEffect } from 'react';

import { AVATAR_SFX_VOLUME, QUIZ_COMPLETE_SOUND, QUIZ_FAIL_SOUND } from '@/constants/sounds';
import { useSound } from '@/hooks/use-sound';

interface QuizResultSoundProps {
  isSuccess: boolean;
}

// 결과 화면 진입음. 결과 페이지가 서버 컴포넌트라 훅을 직접 쓸 수 없어, 재생만 담당하는
// 클라이언트 컴포넌트로 분리했다. 보이는 요소는 없다(null 렌더).
export function QuizResultSound({ isSuccess }: QuizResultSoundProps) {
  const playComplete = useSound(QUIZ_COMPLETE_SOUND, AVATAR_SFX_VOLUME);
  const playFail = useSound(QUIZ_FAIL_SOUND, AVATAR_SFX_VOLUME);

  useEffect(() => {
    // 결과는 화면 진입 시점에 이미 확정돼 있으므로 마운트 때 한 번만 낸다.
    // 퀴즈 화면에서 넘어온 직후라 사용자 제스처가 이미 있어 autoplay 차단에 걸리지 않는다.
    if (isSuccess) {
      playComplete();
    } else {
      playFail();
    }
  }, [isSuccess, playComplete, playFail]);

  return null;
}
