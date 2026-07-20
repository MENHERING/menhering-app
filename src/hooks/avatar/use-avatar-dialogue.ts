'use client';

import { useEffect, useState } from 'react';

import { AVATAR_DIALOGUE } from '@/constants/avatar-dialogue';
import type { Mood } from '@/types/mypage/model';

// 대사가 자동으로 넘어가는 주기. 탭 트리거는 두지 않는다 — 연타 시 대사가 정신없이 바뀌기 때문.
const ROTATE_INTERVAL_MS = 12000;

// exclude를 뺀 나머지에서 균등 랜덤으로 인덱스를 고른다(같은 대사가 연달아 나오는 것 방지).
// 0 ~ length-2에서 뽑은 뒤 exclude 이상이면 1 밀어, exclude만 건너뛴 균등 분포를 만든다.
function pickIndexExcluding(length: number, exclude: number): number {
  if (length <= 1) return 0;
  const r = Math.floor(Math.random() * (length - 1));

  return r >= exclude ? r + 1 : r;
}

/**
 * 감정에 맞는 대사를 하나 골라 들고 있다가, ROTATE_INTERVAL_MS마다 다른 대사로 자동 전환한다.
 * 홈·아바타 탭 어디서든 감정만 넘기면 쓸 수 있다(표시는 호출부의 말풍선이 담당).
 *
 * 초기값은 항상 0번이라 SSR·클라 첫 렌더가 일치한다(하이드레이션 불일치 없음). 랜덤 전환은
 * 마운트 후 타이머에서만 일어난다. 감정이 바뀌면 새 배열의 0번으로 리셋한다.
 */
export function useAvatarDialogue(mood: Mood): string {
  const lines = AVATAR_DIALOGUE[mood];
  const [index, setIndex] = useState(0);

  // 감정이 바뀌면 새 배열 기준 0번부터 다시 시작. effect의 setState(캐스케이딩 렌더) 대신
  // 이전 감정을 상태로 들고 렌더 중 비교하는 React 권장 패턴을 쓴다.
  const [prevMood, setPrevMood] = useState(mood);
  if (prevMood !== mood) {
    setPrevMood(mood);
    setIndex(0);
  }

  useEffect(() => {
    if (lines.length <= 1) return;

    const timerId = setInterval(() => {
      setIndex((prev) => pickIndexExcluding(lines.length, prev));
    }, ROTATE_INTERVAL_MS);

    return () => clearInterval(timerId);
  }, [lines]);

  // 감정 전환 직후 index가 새 배열 범위를 잠깐 벗어날 수 있어(리셋 effect 실행 전) 0번으로 폴백.
  return lines[index] ?? lines[0];
}
