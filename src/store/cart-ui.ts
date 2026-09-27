"use client";

import { create } from "zustand";

/**
 * Cart drawer state (015). One drawer for the whole app: a right panel from 768px, a bottom sheet
 * below it, mounted once by `CartDrawer` in the locale layout. Not persisted between reloads.
 *
 * `phase` is "open" while the drawer is up, "closing" while it slides out (the drawer calls
 * `settle()` when the animation ends) and "closed" when it is gone from the DOM. The drawer
 * never closes by itself: only Esc, the scrim, the close button, a link inside it or a page change.
 *
 * `mode` only picks the title: "added" after an add ("Додано в кошик"), "cart" when the buyer
 * opened the cart on purpose ("Кошик").
 *
 * `addedAt` is the time of the last add; while it is non-zero the header cart pill shows the
 * brand gradient. The pill timer below resets it after `PILL_FLASH_MS`.
 */
export type CartDrawerMode = "added" | "cart";
export type CartDrawerPhase = "closed" | "open" | "closing";

/**
 * Legacy names stay valid so older call sites keep working: "mini" was the post-add popover and
 * now opens the drawer in "added" mode, "modal" was the full cart and opens it in "cart" mode.
 */
export type CartPanel = "mini" | "modal" | CartDrawerMode;

type CartUIState = {
  phase: CartDrawerPhase;
  mode: CartDrawerMode;
  addedAt: number;
  show: (panel?: CartPanel) => void;
  close: () => void;
  settle: () => void;
};

export const PILL_FLASH_MS = 1200;

export const useCartUI = create<CartUIState>()((set) => ({
  phase: "closed",
  mode: "cart",
  addedAt: 0,
  show: (panel = "cart") =>
    set({ phase: "open", mode: panel === "mini" || panel === "added" ? "added" : "cart" }),
  close: () => set((state) => (state.phase === "open" ? { phase: "closing" } : state)),
  settle: () => set((state) => (state.phase === "closing" ? { phase: "closed" } : state)),
}));

let flashTimer: ReturnType<typeof setTimeout> | undefined;

/** Flashes the header cart pill for `PILL_FLASH_MS` without opening the drawer. */
export function flashCartPill() {
  const at = Date.now();
  useCartUI.setState({ addedAt: at });
  if (flashTimer) clearTimeout(flashTimer);
  flashTimer = setTimeout(() => {
    if (useCartUI.getState().addedAt === at) useCartUI.setState({ addedAt: 0 });
  }, PILL_FLASH_MS);
}

/** Call right after adding a product: opens the drawer as the confirmation and flashes the pill. */
export function announceAdded() {
  useCartUI.getState().show("added");
  flashCartPill();
}
