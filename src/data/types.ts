import type { Locale } from "@/i18n";

export type Localized = Record<Locale, string>;

/** Значение характеристики: чаще одинаково на обоих языках, иногда нет. */
export type SpecValue = string | Localized;

export type SpecKey =
  | "power"
  | "voltage"
  | "impact"
  | "chuck"
  | "rpm"
  | "bpm"
  | "torque"
  | "disc"
  | "depth"
  | "range"
  | "accuracy"
  | "lines"
  | "orbit"
  | "pad"
  | "weight"
  | "battery"
  | "pieces"
  | "material"
  | "standard"
  | "size";

export type Power = "corded" | "cordless" | "none";

export type Badge = "new" | "hit";

export type Brand = {
  slug: string;
  name: string;
  country: Localized;
};

export type Platform = {
  slug: string;
  /** Короткое торговое имя платформы: LXT 18V, XR 18V, M18. */
  name: string;
  brand: string;
  voltage: number;
  note: Localized;
};

export type Category = {
  slug: string;
  name: Localized;
  /** Родительный падеж для заголовков: «12 перфораторів». */
  blurb: Localized;
  /** Модель из tools/products/render_products.py, на которой построены packshot. */
  tool: string;
};

export type Product = {
  slug: string;
  /** Путь к собственному фото товара, например "/products/makita-dhr243z-photo.png".
   *  Без него imageOf() берёт фолбэк «категория + бренд» (общее фото на модельный ряд). */
  image?: string;
  brand: string;
  model: string;
  sku: string;
  category: string;
  platform?: string;
  power: Power;
  price: number;
  oldPrice?: number;
  stock: number;
  badges: Badge[];
  /** Параметр, который решает при выборе: показываем поверх фото на hover. */
  key: { spec: SpecKey; value: SpecValue };
  specs: [SpecKey, SpecValue][];
  kit: Localized[];
  warranty: number;
  sold: number;
  description: Localized;
  /** One line for the card's hover reveal. Set only where the first sentence of `description`
   *  runs past two lines; shortOf() derives the rest. */
  short?: Localized;
};

export function localize(value: SpecValue, locale: Locale): string {
  if (typeof value !== "string") return value[locale];
  return locale === "en" ? unitsToEn(value) : value;
}

/** Plain spec strings are written in Ukrainian units ("2,4 Дж", "18 В"); English gets SI symbols and a decimal point. */
const EN_UNITS: [string, string][] = [
  ["Н·м", "Nm"],
  ["мм/м", "mm/m"],
  ["об/хв", "rpm"],
  ["уд/хв", "bpm"],
  ["Вт", "W"],
  ["Дж", "J"],
  ["кг", "kg"],
  ["мм", "mm"],
  ["см", "cm"],
  ["м", "m"],
  ["В", "V"],
];

function unitsToEn(value: string): string {
  let out = value.replace(/(\d),(\d)/g, "$1.$2");
  for (const [ua, en] of EN_UNITS) {
    out = out.replace(new RegExp(`(?<![\\u0400-\\u04FF])${ua}(?![\\u0400-\\u04FF])`, "g"), en);
  }
  return out;
}
