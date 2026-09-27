"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Localized } from "@/data/types";

/**
 * Города доставки для выбора в шапке и подсказки в чекауте. Список — крупные города,
 * плюс свободный ввод через customCity, когда покупатель выбирает «Інше місто».
 */
export const CITIES: { slug: string; name: Localized }[] = [
  { slug: "kyiv", name: { ua: "Київ", ru: "Киев" } },
  { slug: "lviv", name: { ua: "Львів", ru: "Львов" } },
  { slug: "odesa", name: { ua: "Одеса", ru: "Одесса" } },
  { slug: "dnipro", name: { ua: "Дніпро", ru: "Днепр" } },
  { slug: "kharkiv", name: { ua: "Харків", ru: "Харьков" } },
  { slug: "zaporizhzhia", name: { ua: "Запоріжжя", ru: "Запорожье" } },
  { slug: "vinnytsia", name: { ua: "Вінниця", ru: "Винница" } },
  { slug: "poltava", name: { ua: "Полтава", ru: "Полтава" } },
];

export const CUSTOM_CITY_SLUG = "custom";

/** Склад и салон компании — Київ, поэтому туда доставка на день быстрее. */
const FAST_SLUG = "kyiv";

type LocationState = {
  citySlug: string;
  customCity: string;
  setCity: (slug: string) => void;
  setCustomCity: (value: string) => void;
};

export const useLocation = create<LocationState>()(
  persist(
    (set) => ({
      citySlug: FAST_SLUG,
      customCity: "",
      setCity: (slug) => set({ citySlug: slug }),
      setCustomCity: (value) => set({ customCity: value, citySlug: CUSTOM_CITY_SLUG }),
    }),
    { name: "profitool-location" },
  ),
);

/** Имя текущего города на нужном языке; для «іншого міста» — то, что ввёл покупатель. */
export function cityName(locale: "ua" | "ru", state: { citySlug: string; customCity: string }): string {
  if (state.citySlug === CUSTOM_CITY_SLUG) return state.customCity;
  return CITIES.find((city) => city.slug === state.citySlug)?.name[locale] ?? state.customCity;
}

/** Насколько быстрее доедет Нова Пошта: до складового города — день, до остальных — два. */
export function isFastDelivery(slug: string): boolean {
  return slug === FAST_SLUG;
}
