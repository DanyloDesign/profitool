import { ua } from "./ua";
import { ru } from "./ru";

export const locales = ["ua", "ru"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ua";

export type Dict = typeof ua;

const dicts: Record<Locale, Dict> = { ua, ru };

export function getDict(locale: Locale): Dict {
  return dicts[locale] ?? dicts[defaultLocale];
}

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Тег для атрибута lang: украинский это uk, а не ua. */
export const htmlLang: Record<Locale, string> = { ua: "uk", ru: "ru" };

/** Подменяет локаль в текущем пути, сохраняя раздел и параметры. */
export function swapLocale(pathname: string, next: Locale): string {
  const rest = pathname.replace(/^\/(ua|ru)(?=\/|$)/, "");
  return `/${next}${rest || ""}`;
}
