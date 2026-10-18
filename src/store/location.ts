"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Localized } from "@/data/types";

/**
 * Города доставки для выбора в шапке и подсказки в чекауте. Список — крупные города,
 * плюс свободный ввод через customCity, когда покупатель выбирает «Інше місто».
 */
export const CITIES: { slug: string; name: Localized }[] = [
  { slug: "kyiv", name: { ua: "Київ", en: "Kyiv" } },
  { slug: "lviv", name: { ua: "Львів", en: "Lviv" } },
  { slug: "odesa", name: { ua: "Одеса", en: "Odesa" } },
  { slug: "dnipro", name: { ua: "Дніпро", en: "Dnipro" } },
  { slug: "kharkiv", name: { ua: "Харків", en: "Kharkiv" } },
  { slug: "zaporizhzhia", name: { ua: "Запоріжжя", en: "Zaporizhzhia" } },
  { slug: "vinnytsia", name: { ua: "Вінниця", en: "Vinnytsia" } },
  { slug: "poltava", name: { ua: "Полтава", en: "Poltava" } },
];

export const CUSTOM_CITY_SLUG = "custom";

/** Город по умолчанию. Магазин не в Киеве: Нова Пошта едет до всех городов одинаково. */
const DEFAULT_SLUG = "kyiv";

type LocationState = {
  citySlug: string;
  customCity: string;
  setCity: (slug: string) => void;
  setCustomCity: (value: string) => void;
};

export const useLocation = create<LocationState>()(
  persist(
    (set) => ({
      citySlug: DEFAULT_SLUG,
      customCity: "",
      setCity: (slug) => set({ citySlug: slug }),
      setCustomCity: (value) => set({ customCity: value, citySlug: CUSTOM_CITY_SLUG }),
    }),
    { name: "profitool-location" },
  ),
);

/** Имя текущего города на нужном языке; для «іншого міста» — то, что ввёл покупатель. */
export function cityName(locale: "ua" | "en", state: { citySlug: string; customCity: string }): string {
  if (state.citySlug === CUSTOM_CITY_SLUG) return state.customCity;
  return CITIES.find((city) => city.slug === state.citySlug)?.name[locale] ?? state.customCity;
}
