import type { Locale } from "@/i18n";
import { brandBySlug, categories, categoryBySlug, platformBySlug } from "@/data/taxonomy";
import { products } from "@/data/products";
import { localize, type Category, type Product } from "@/data/types";

/**
 * One matcher for the header suggestions, the search page and the catalog `?q=`.
 * A query matches a product when every word finds something: brand (Latin or Cyrillic),
 * model or SKU without spaces and hyphens, section name or a common word for it
 * ("болгарка", "КШМ", "шуруповерт"), battery platform, power type, or a spec value.
 */

/** Lower case, "ё" as "е", no spaces, hyphens, dots or middle dots: "DDF 484" → "ddf484". */
export function normalize(text: string): string {
  return text.toLowerCase().replace(/ё/g, "е").replace(/[\s\-–—.·]/g, "");
}

/** Word stems people type for a section, Ukrainian and Russian together. */
const CATEGORY_WORDS: Record<string, string[]> = {
  "rotary-hammers": ["перфор", "sds", "бетон", "штроб", "hammer"],
  drills: ["шуруп", "шурупокрут", "шуруповерт", "дриль", "дрел", "викрутк", "отвертк", "drill", "driver"],
  grinders: ["болгар", "кшм", "ушм", "кутов", "углов", "grinder"],
  saws: ["пил", "циркуляр", "дисковапил", "дисковаяпил", "saw"],
  sanders: ["шліф", "шлиф", "ексцентр", "эксцентр", "орбітал", "орбитал", "sander"],
  measuring: ["лазер", "рівен", "рівень", "уровен", "нівел", "нивел", "далеком", "дальном", "laser", "level"],
  accessories: ["біт", "бит", "свердл", "сверл", "оснаст", "коронк", "бур", "диск", "bit"],
  safety: ["каск", "захист", "защит", "шолом", "helmet"],
};

/** Brand names as people write them in Cyrillic. */
const BRAND_WORDS: Record<string, string[]> = {
  makita: ["макіт", "макит"],
  bosch: ["бош"],
  dewalt: ["деволт", "девольт", "дэволт", "девалт"],
  metabo: ["метабо"],
  milwaukee: ["мілвок", "мілуок", "милуок", "милвок"],
  ryobi: ["рьоб", "риоб", "рйоб"],
};

const POWER_WORDS: Record<Product["power"], string[]> = {
  cordless: ["акум", "аккум", "безпров", "беспров"],
  corded: ["мереж", "сетев", "провод"],
  none: [],
};

/** Short words that carry no meaning in a product query. */
const STOP_WORDS = new Set(["з", "с", "і", "и", "й", "в", "у", "на", "по", "до", "для", "та", "the"]);

/** Query completions per section, the ones the suggestions panel offers. Each returns products. */
const COMPLETIONS: Record<string, Record<Locale, string[]>> = {
  "rotary-hammers": {
    ua: ["перфоратор SDS-Plus", "перфоратор акумуляторний", "перфоратор Makita"],
    ru: ["перфоратор SDS-Plus", "перфоратор аккумуляторный", "перфоратор Makita"],
  },
  drills: {
    ua: ["шурупокрут акумуляторний", "шурупокрут DeWalt", "шурупокрут Makita"],
    ru: ["шуруповёрт аккумуляторный", "шуруповёрт DeWalt", "шуруповёрт Makita"],
  },
  grinders: {
    ua: ["болгарка 125 мм", "болгарка акумуляторна", "болгарка Bosch"],
    ru: ["болгарка 125 мм", "болгарка аккумуляторная", "болгарка Bosch"],
  },
  saws: {
    ua: ["пила дискова", "пила акумуляторна", "пила 184 мм"],
    ru: ["пила дисковая", "пила аккумуляторная", "пила 184 мм"],
  },
  sanders: {
    ua: ["шліфмашина ексцентрикова", "шліфмашина 125 мм", "шліфмашина Metabo"],
    ru: ["шлифмашина эксцентриковая", "шлифмашина 125 мм", "шлифмашина Metabo"],
  },
  measuring: {
    ua: ["лазерний рівень 360°", "лазерний рівень Bosch", "далекомір"],
    ru: ["лазерный уровень 360°", "лазерный уровень Bosch", "дальномер"],
  },
  accessories: {
    ua: ["біти 1/4″", "свердла HSS-Co", "бури SDS-Plus"],
    ru: ["биты 1/4″", "свёрла HSS-Co", "буры SDS-Plus"],
  },
  safety: {
    ua: ["каска EN 397", "каска Milwaukee", "каска Metabo"],
    ru: ["каска EN 397", "каска Milwaukee", "каска Metabo"],
  },
};

function tokens(query: string): string[] {
  return query
    .toLowerCase()
    .split(/\s+/)
    .map(normalize)
    .filter((token) => token && !STOP_WORDS.has(token));
}

/** A stem list matches a token when the token starts with a stem, or a stem starts with a token
 *  of three letters or more (so "болг" already finds grinders). */
function hitsStems(token: string, stems: string[] | undefined): boolean {
  return !!stems?.some((stem) => token.startsWith(stem) || (token.length >= 3 && stem.startsWith(token)));
}

function categoryMatches(category: Category, token: string): boolean {
  if (hitsStems(token, CATEGORY_WORDS[category.slug])) return true;
  return [category.name.ua, category.name.ru].some((name) => normalize(name).startsWith(token));
}

/** 3 = model or SKU, 2 = brand, 1 = section, platform, power or spec; 0 = no match. */
function tokenScore(product: Product, token: string): number {
  if (normalize(product.model).includes(token) || normalize(product.sku).includes(token)) return 3;
  const brandName = brandBySlug.get(product.brand)?.name ?? product.brand;
  if (normalize(brandName).startsWith(token) || hitsStems(token, BRAND_WORDS[product.brand])) return 2;
  const category = categoryBySlug.get(product.category);
  if (category && categoryMatches(category, token)) return 1;
  const platform = product.platform ? platformBySlug.get(product.platform) : undefined;
  if (platform && normalize(platform.name).startsWith(token)) return 1;
  if (hitsStems(token, POWER_WORDS[product.power])) return 1;
  if (
    token.length >= 2 &&
    product.specs.some(([, value]) => normalize(localize(value, "ua")).includes(token) || normalize(localize(value, "ru")).includes(token))
  )
    return 1;
  return 0;
}

/** Sum of word scores, or 0 when any word finds nothing. */
export function queryScore(product: Product, query: string): number {
  const words = tokens(query);
  if (!words.length) return 0;
  let total = 0;
  for (const word of words) {
    const score = tokenScore(product, word);
    if (!score) return 0;
    total += score;
  }
  return total;
}

export function matchesQuery(product: Product, query: string): boolean {
  return queryScore(product, query) > 0;
}

/** Best matches first (model hits beat brand hits beat section hits), then bestsellers. */
export function searchProducts(query: string, limit = 5): Product[] {
  return products
    .map((product) => ({ product, score: queryScore(product, query) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || b.product.sold - a.product.sold)
    .slice(0, limit)
    .map(({ product }) => product);
}

/** Sections the query names, in catalog order. */
export function searchCategories(query: string): Category[] {
  const words = tokens(query);
  if (!words.length) return [];
  return categories.filter((category) => words.some((word) => categoryMatches(category, word)));
}

/** Completions of the query inside the first section it names. `head` is what the person typed,
 *  `tail` is the rest (the panel shows the rest in bold). */
export function searchCompletions(query: string, locale: Locale, limit = 3): { text: string; head: string; tail: string }[] {
  const category = searchCategories(query)[0];
  if (!category) return [];
  const typed = query.trim().toLowerCase();
  return (COMPLETIONS[category.slug]?.[locale] ?? [])
    .filter((text) => text.toLowerCase() !== typed)
    .slice(0, limit)
    .map((text) => {
      const starts = typed.length > 0 && text.toLowerCase().startsWith(typed);
      return { text, head: starts ? text.slice(0, typed.length) : "", tail: starts ? text.slice(typed.length) : text };
    });
}

/** Every completion the panel can offer, for tests: each must find at least one product. */
export function allCompletions(locale: Locale): string[] {
  return Object.values(COMPLETIONS).flatMap((byLocale) => byLocale[locale]);
}
