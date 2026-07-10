import { create } from 'zustand';

import { DEFAULT_CHARACTER_TYPE, DEFAULT_COLOR_THEME, DEFAULT_NICKNAME } from '@/constants/avatar';
import type { Avatar, CharacterType, ColorTheme } from '@/types/avatar';

// 아바타 탭의 편집(draft) 상태. 실제 저장은 Server Action이 담당하고,
// 이 스토어는 "저장하기" 전까지의 UI 임시 상태만 관리한다.
// 감정(mood)은 편집값이 아니라 서버 파생값이라 avatar-status-store에 따로 둔다.
interface AvatarState {
  characterType: CharacterType;
  colorTheme: ColorTheme;
  nickname: string;
  // 서버에서 불러온 초기값 (isDirty 계산 기준)
  initial: Pick<Avatar, 'characterType' | 'colorTheme' | 'nickname'> | null;

  setCharacterType: (characterType: CharacterType) => void;
  setColorTheme: (colorTheme: ColorTheme) => void;
  setNickname: (nickname: string) => void;
  // 서버 조회값으로 초기화(저장 성공 시 baseline 갱신에도 사용)
  initFrom: (avatar: Pick<Avatar, 'characterType' | 'colorTheme' | 'nickname'>) => void;
}

export const useAvatarStore = create<AvatarState>((set) => ({
  characterType: DEFAULT_CHARACTER_TYPE,
  colorTheme: DEFAULT_COLOR_THEME,
  nickname: DEFAULT_NICKNAME,
  initial: null,

  setCharacterType: (characterType) => set({ characterType }),
  setColorTheme: (colorTheme) => set({ colorTheme }),
  setNickname: (nickname) => set({ nickname }),

  initFrom: (avatar) =>
    set({
      characterType: avatar.characterType,
      colorTheme: avatar.colorTheme,
      nickname: avatar.nickname,
      initial: avatar,
    }),
}));

// 초기값 대비 변경 여부. 컴포넌트에서 useAvatarStore(selectIsDirty)로 구독.
export function selectIsDirty(state: AvatarState): boolean {
  if (!state.initial) return false;

  return (
    state.characterType !== state.initial.characterType ||
    state.colorTheme !== state.initial.colorTheme ||
    state.nickname !== state.initial.nickname
  );
}
