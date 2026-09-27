"use client";

import { create } from "zustand";

/**
 * Какое окно корзины открыто. "mini" — выпадашка под кнопкой в шапке, её показываем после
 * «В кошик» вместо тоста. "modal" — полная корзина поверх страницы на десктопе и планшете,
 * на телефоне корзина остаётся страницей /cart. Состояние не сохраняется между перезагрузками.
 */
export type CartPanel = "mini" | "modal" | null;

type CartUIState = {
  panel: CartPanel;
  show: (panel: Exclude<CartPanel, null>) => void;
  close: () => void;
};

export const useCartUI = create<CartUIState>()((set) => ({
  panel: null,
  show: (panel) => set({ panel }),
  close: () => set({ panel: null }),
}));

/** Вызывать после добавления товара: открывает мини-корзину как подтверждение. */
export const announceAdded = () => useCartUI.getState().show("mini");
