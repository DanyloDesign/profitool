"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = { slug: string; qty: number };

type CartState = {
  items: CartItem[];
  add: (slug: string, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (slug, qty = 1) =>
        set((state) => {
          const existing = state.items.find((item) => item.slug === slug);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.slug === slug ? { ...item, qty: Math.min(item.qty + qty, 99) } : item,
              ),
            };
          }
          return { items: [...state.items, { slug, qty }] };
        }),
      setQty: (slug, qty) =>
        set((state) => ({
          items:
            qty <= 0
              ? state.items.filter((item) => item.slug !== slug)
              : state.items.map((item) => (item.slug === slug ? { ...item, qty } : item)),
        })),
      remove: (slug) => set((state) => ({ items: state.items.filter((i) => i.slug !== slug) })),
      clear: () => set({ items: [] }),
    }),
    { name: "profitool-cart" },
  ),
);

/**
 * Последний оформленный заказ: чекаут сохраняет его перед очисткой корзины, пустая корзина
 * предлагает «Повторити замовлення». Бэкенда нет, поэтому живёт только в этом браузере.
 */
type LastOrderState = {
  items: CartItem[];
  number: string | null;
  save: (items: CartItem[], number: string) => void;
};

export const useLastOrder = create<LastOrderState>()(
  persist(
    (set) => ({
      items: [],
      number: null,
      save: (items, number) => set({ items, number }),
    }),
    { name: "profitool-last-order" },
  ),
);

export const COMPARE_LIMIT = 4;

type CompareState = {
  slugs: string[];
  toggle: (slug: string) => void;
  clear: () => void;
};

export const useCompare = create<CompareState>()(
  persist(
    (set) => ({
      slugs: [],
      toggle: (slug) =>
        set((state) => {
          if (state.slugs.includes(slug)) {
            return { slugs: state.slugs.filter((s) => s !== slug) };
          }
          if (state.slugs.length >= COMPARE_LIMIT) return state;
          return { slugs: [...state.slugs, slug] };
        }),
      clear: () => set({ slugs: [] }),
    }),
    { name: "profitool-compare" },
  ),
);

type WishlistState = {
  slugs: string[];
  toggle: (slug: string) => void;
};

export const useWishlist = create<WishlistState>()(
  persist(
    (set) => ({
      slugs: [],
      toggle: (slug) =>
        set((state) => ({
          slugs: state.slugs.includes(slug)
            ? state.slugs.filter((s) => s !== slug)
            : [...state.slugs, slug],
        })),
    }),
    { name: "profitool-wishlist" },
  ),
);

type PlatformState = {
  /** Аккумуляторная платформа покупателя: держим между визитами. */
  slug: string | null;
  set: (slug: string | null) => void;
};

export const usePlatform = create<PlatformState>()(
  persist(
    (set) => ({
      slug: null,
      set: (slug) => set({ slug }),
    }),
    { name: "profitool-platform" },
  ),
);
