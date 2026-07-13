import { create } from 'zustand';

import { OWNED_CHARACTERS, OWNED_THEMES, PLACEHOLDER_COIN } from '@/constants/avatar';
import type { CharacterType, ColorTheme } from '@/types/avatar';

// 구매 확인 대기 중인 항목(모달 표시용).
export type PendingBuy =
  | { kind: 'character'; value: CharacterType; cost: number }
  | { kind: 'theme'; value: ColorTheme; cost: number };

// 코인 잔액은 서버(users.coin)에서 읽어 initCoin으로 주입한다. 보유 목록·구매 차감은 아직
// 클라이언트 데모(새로고침 리셋). TODO: 보유(보유 테이블)·구매 트랜잭션은 서버 RPC로 교체.
interface AvatarEconomyState {
  coin: number;
  ownedCharacters: CharacterType[];
  ownedThemes: ColorTheme[];
  pendingBuy: PendingBuy | null;
  // 서버 조회값(users.coin)으로 코인 잔액을 초기화한다(아바타 페이지 마운트 시 1회).
  initCoin: (coin: number) => void;
  requestBuy: (buy: PendingBuy) => void;
  cancelBuy: () => void;
  // 구매 확정. 성공 시 코인 차감·보유 추가 후 true, 불가(잔액 부족/이미 보유)면 차감 없이 false.
  // 반환값으로 호출부가 "구매 성공한 항목만" 장착하도록 한다(장착이 결제와 어긋나지 않게).
  confirmBuy: () => boolean;
}

export const useAvatarEconomyStore = create<AvatarEconomyState>((set, get) => ({
  // 서버값 주입 전 초기 표시값(initCoin이 마운트 시 실제 users.coin으로 덮는다).
  coin: PLACEHOLDER_COIN,
  ownedCharacters: [...OWNED_CHARACTERS],
  ownedThemes: [...OWNED_THEMES],
  pendingBuy: null,

  initCoin: (coin) => set({ coin }),
  requestBuy: (buy) => set({ pendingBuy: buy }),
  cancelBuy: () => set({ pendingBuy: null }),

  confirmBuy: () => {
    const { pendingBuy: buy, coin, ownedCharacters, ownedThemes } = get();

    // 대기 없음/잔액 부족/이미 보유면 차감 없이 대기만 해제하고 실패 반환.
    if (!buy || coin < buy.cost) {
      set({ pendingBuy: null });
      return false;
    }

    if (buy.kind === 'character') {
      if (ownedCharacters.includes(buy.value)) {
        set({ pendingBuy: null });
        return false;
      }
      set({
        coin: coin - buy.cost,
        ownedCharacters: [...ownedCharacters, buy.value],
        pendingBuy: null,
      });
      return true;
    }

    if (ownedThemes.includes(buy.value)) {
      set({ pendingBuy: null });
      return false;
    }
    set({ coin: coin - buy.cost, ownedThemes: [...ownedThemes, buy.value], pendingBuy: null });
    return true;
  },
}));
