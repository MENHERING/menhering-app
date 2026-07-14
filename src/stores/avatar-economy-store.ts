import { create } from 'zustand';

import type { CharacterType, ColorTheme } from '@/types/avatar';

// 구매 확인 대기 중인 항목(모달 표시용).
export type PendingBuy =
  | { kind: 'character'; value: CharacterType; cost: number }
  | { kind: 'theme'; value: ColorTheme; cost: number };

// 코인 잔액·보유 목록은 서버에서 읽어 init*으로 주입한다(users.coin, avatar_inventory).
// 구매는 서버 RPC(buy_avatar_item)가 원자적으로 처리하고, 성공 시 반환된 잔액으로 덮는다.
// 이 스토어는 서버 결과를 반영만 할 뿐, 클라에서 코인을 직접 차감하지 않는다.
interface AvatarEconomyState {
  coin: number;
  ownedCharacters: CharacterType[];
  ownedThemes: ColorTheme[];
  pendingBuy: PendingBuy | null;
  // 구매 요청이 서버에서 진행 중인지(모달 로딩·중복 제출 방지).
  isBuying: boolean;
  // 서버 조회값으로 초기화(아바타 페이지 마운트 시 1회, 멱등).
  initCoin: (coin: number) => void;
  initOwned: (owned: { characters: CharacterType[]; themes: ColorTheme[] }) => void;
  requestBuy: (buy: PendingBuy) => void;
  cancelBuy: () => void;
  setBuying: (isBuying: boolean) => void;
  // 서버 결제 성공 후 반영: 잔액을 서버값(coin)으로 덮고 보유에 추가, 대기 해제.
  applyPurchase: (buy: PendingBuy, coin: number) => void;
}

export const useAvatarEconomyStore = create<AvatarEconomyState>((set) => ({
  // 서버값 주입 전 초기값. init*이 마운트 시(첫 페인트 전) 실제 값으로 덮는다.
  coin: 0,
  ownedCharacters: [],
  ownedThemes: [],
  pendingBuy: null,
  isBuying: false,

  initCoin: (coin) => set({ coin }),
  initOwned: ({ characters, themes }) => set({ ownedCharacters: characters, ownedThemes: themes }),
  requestBuy: (buy) => set({ pendingBuy: buy }),
  cancelBuy: () => set({ pendingBuy: null }),
  setBuying: (isBuying) => set({ isBuying }),

  applyPurchase: (buy, coin) =>
    set((state) =>
      buy.kind === 'character'
        ? {
            coin,
            // 이미 보유면 추가하지 않는다(중복 방지). 서버가 이미보유를 막지만 방어적으로.
            ownedCharacters: state.ownedCharacters.includes(buy.value)
              ? state.ownedCharacters
              : [...state.ownedCharacters, buy.value],
            pendingBuy: null,
          }
        : {
            coin,
            ownedThemes: state.ownedThemes.includes(buy.value)
              ? state.ownedThemes
              : [...state.ownedThemes, buy.value],
            pendingBuy: null,
          },
    ),
}));
