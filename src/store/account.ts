"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DeliveryMethod } from "@/lib/shop";

/**
 * Демо-кабінет (016): бекенду немає, вхід і реєстрація просто записують сесію в цей браузер.
 * Ім'я тут завжди задане (форма входу/реєстрації підставляє його з пошти), профіль може змінити.
 */
export type Session = { name: string; email: string; phone: string };

type AccountState = {
  session: Session | null;
  login: (session: Session) => void;
  logout: () => void;
  update: (partial: Partial<Session>) => void;
};

export const useAccount = create<AccountState>()(
  persist(
    (set) => ({
      session: null,
      login: (session) => set({ session }),
      logout: () => set({ session: null }),
      update: (partial) =>
        set((state) => (state.session ? { session: { ...state.session, ...partial } } : state)),
    }),
    { name: "profitool-account" },
  ),
);

export type Payment = "card" | "delivery" | "invoice";

/**
 * Рядок замовлення тримає лише slug і цифри на момент покупки, а не весь товар: товар може
 * змінитись або зникнути з каталогу. Під час відрисовки резолвимо через productBySlug
 * (src/data/products.ts) і мовчки пропускаємо невідомі slug.
 */
export type OrderLine = { slug: string; qty: number; price: number; oldPrice?: number };

export type Order = {
  number: string;
  /** ISO-рядок: Intl.DateTimeFormat форматує його в компоненті під потрібну локаль. */
  date: string;
  lines: OrderLine[];
  total: number;
  delivery: number;
  method: DeliveryMethod;
  payment: Payment;
};

type OrdersState = {
  /** Найновіші зверху: checkout-form додає замовлення через add(), список більше ніде не сортують. */
  orders: Order[];
  add: (order: Order) => void;
};

export const useOrders = create<OrdersState>()(
  persist(
    (set) => ({
      orders: [],
      add: (order) => set((state) => ({ orders: [order, ...state.orders] })),
    }),
    { name: "profitool-orders" },
  ),
);
