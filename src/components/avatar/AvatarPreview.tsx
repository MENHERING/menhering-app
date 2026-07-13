'use client';

import { useId } from 'react';

import { AvatarBackdrop } from '@/components/avatar/AvatarBackdrop';
import { AvatarHero } from '@/components/avatar/AvatarHero';
import { NicknameField } from '@/components/avatar/NicknameField';
import { Section } from '@/components/common/Section';
import { AVATAR_SFX_VOLUME, AVATAR_TAP_SOUND } from '@/constants/sounds';
import { useSound } from '@/hooks/use-sound';
import { useAvatarStatusStore } from '@/stores/avatar-status-store';
import { useAvatarStore } from '@/stores/avatar-store';

interface AvatarPreviewProps {
  // TODO: 레벨/XP는 user_progress 도메인 연동 후 실제 값으로 교체
  level?: number;
}

export function AvatarPreview({ level }: AvatarPreviewProps) {
  const characterType = useAvatarStore((s) => s.characterType);
  const colorTheme = useAvatarStore((s) => s.colorTheme);
  const nickname = useAvatarStore((s) => s.nickname);
  const setNickname = useAvatarStore((s) => s.setNickname);
  // 감정은 편집값이 아니라 서버 파생값이라 별도 스토어(avatar-status-store)에서 읽는다.
  const mood = useAvatarStatusStore((s) => s.mood);
  // 감정 안내를 버튼 이름에서 분리해 담는 live 영역 id (버튼 포커스 중 감정이 바뀌어도 이름은 그대로).
  const moodStatusId = useId();

  const playTap = useSound(AVATAR_TAP_SOUND, AVATAR_SFX_VOLUME);

  return (
    // 공용 Section 카드(rounded·border·shadow)를 재사용하되, 숲 배경 풀블리드를 위해
    // 흰 배경·좌우 패딩만 제거(bg-transparent·px-0)하고 relative·overflow-hidden을 더한다.
    // TODO: 다크모드 도입 시 이름표 배경 `dark:bg-neutral-900`
    <Section
      shadow="custom"
      isBorder
      className="relative overflow-hidden bg-transparent px-0 sm:px-0 lg:px-0"
    >
      {/* 숲 배경 — 카드 전체 */}
      <AvatarBackdrop />

      {/* Lv 배지 */}
      {typeof level === 'number' && (
        <span className="bg-coral absolute top-3 right-3 z-10 rounded-full px-2.5 py-0.5 text-xs font-bold text-white shadow-sm">
          Lv.{level}
        </span>
      )}

      {/* 콘텐츠: 캐릭터 + 이름표 */}
      <div className="relative z-10 flex flex-col items-center gap-0 px-4 pt-2 pb-4">
        {/* 캐릭터 탭 → 효과음(+ 살짝 눌리는 press 피드백). 반응 모션(귀·하트)은 Live2DCharacter 내부.
            접근성 이름은 버튼의 aria-label이 담당하므로 내부 AvatarHero는 장식(title 생략)으로 둔다.
            감정 심볼·기운 배경은 aria-hidden(시각 정보)이라, 감정은 아래 aria-live 영역으로 전달한다.
            ⚠️ 감정을 버튼 이름에 넣으면 감정이 바뀔 때마다 이름이 변해 포커스된 버튼이 다시 낭독된다.
            버튼 이름은 동작(쓰다듬기)으로 고정하고, 감정은 describedby로 연결한 별도 status 영역에 둔다. */}
        <button
          type="button"
          onClick={playTap}
          aria-label="아바타 쓰다듬기"
          aria-describedby={moodStatusId}
          className="focus-visible:ring-coral rounded-full transition-transform outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-95"
        >
          <AvatarHero
            characterType={characterType}
            colorTheme={colorTheme}
            mood={mood}
            className="size-72"
            size={288}
          />
        </button>

        {/* 감정 안내 전용 live 영역. polite라 감정 변경을 조용히 알리고, 버튼 focus 시 describedby로도 읽힌다. */}
        <span id={moodStatusId} role="status" aria-live="polite" className="sr-only">
          지금 기분: {mood}
        </span>

        {/* 이름표 카드 — 숲 위에 뜬 흰 카드(테마색 coral 테두리). 너비 고정(w-56)으로
            표시↔편집에서 카드 폭이 안 변하게 한다.
            TODO: 앱 다크모드 도입 시 `dark:border-coral dark:bg-neutral-900`(일괄 적용 시) */}
        <div className="border-coral mx-auto -mt-3 w-56 max-w-full rounded-2xl border bg-white px-3 py-3 shadow-md">
          <div className="flex flex-col items-center gap-1">
            <NicknameField nickname={nickname} onSave={setNickname} />

            {/* 캐릭터 종류. TODO: 다크모드 도입 시 `dark:text-neutral-400` */}
            <span className="text-brown-soft text-sm">{characterType}</span>
          </div>
        </div>
      </div>
    </Section>
  );
}
