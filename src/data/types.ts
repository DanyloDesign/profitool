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
};

export function localize(value: SpecValue, locale: Locale): string {
  return typeof value === "string" ? value : value[locale];
}
