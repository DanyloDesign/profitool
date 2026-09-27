import type { Locale } from "@/i18n";
import { asset } from "@/lib/asset";
import { categoryBySlug, platformBySlug } from "@/data/taxonomy";
import { productBySlug, products } from "@/data/products";
import { localize, type Localized, type Product, type SpecKey, type SpecValue } from "@/data/types";
import { plural } from "@/i18n/plural";

/** Неразрывный пробел как разделитель разрядов: 12 490, а не 12490. */
export function price(value: number): string {
  return new Intl.NumberFormat("uk-UA", { maximumFractionDigits: 0 }).format(value);
}

export function discountPercent(product: Product): number | null {
  if (!product.oldPrice || product.oldPrice <= product.price) return null;
  return Math.round((1 - product.price / product.oldPrice) * 100);
}

const PIECES: Record<Locale, [string, string, string]> = {
  ua: ["предмет", "предмети", "предметів"],
  ru: ["предмет", "предмета", "предметов"],
};

/** Ключевой параметр с единицей. Почти везде она уже в значении, у наборов дописываем. */
export function keyValue(product: Product, locale: Locale): string {
  const raw = localize(product.key.value, locale);
  if (product.key.spec === "pieces") return `${raw} ${plural(Number(raw), PIECES[locale])}`;
  return raw;
}

/** Товар показываем настоящим снимком: покупатель должен узнать инструмент.
 *  Есть собственное фото модели — берём его, иначе общий снимок «категория + бренд». */
export function imageOf(product: Product): string {
  if (product.image) return asset(product.image);
  const category = categoryBySlug.get(product.category);
  return asset(`/products/${category?.tool ?? "drill"}-${product.brand}-photo.png`);
}

/** Иконка раздела — стеклянный рендер из Blender, он же в меню каталога. */
export function categoryIcon(slug: string): string {
  const tool = categoryBySlug.get(slug)?.tool ?? "drill";
  return asset(`/products/${tool}-makita-glass.png`);
}

export function href(locale: Locale, path = ""): string {
  return `/${locale}${path}`;
}

export function productHref(locale: Locale, slug: string): string {
  return `/${locale}/product/${slug}`;
}

export function categoryHref(locale: Locale, slug?: string): string {
  return slug ? `/${locale}/catalog/${slug}` : `/${locale}/catalog`;
}

export const FREE_DELIVERY_FROM = 5000;
export const DELIVERY_COST = 120;

export type DeliveryMethod = "novapost" | "courier" | "pickup";

/**
 * Единственный источник итогов заказа (proposal 013, workstream B) — шапка, мини-корзина,
 * страница корзины и чекаут вызывают только эту функцию, чтобы сумма нигде не расходилась.
 * Без `method` доставка в итог не входит (метод ещё не выбран): шапка и мини-корзина показывают
 * сумму товаров, страница корзины — её же, а доставку выносит отдельной строкой-подсказкой.
 * Чекаут передаёт выбранный метод, и тогда доставка прибавляется к сумме («pickup» — бесплатно).
 */
export function orderTotals(items: { slug: string; qty: number }[], method?: DeliveryMethod) {
  const lines = items
    .map((item) => {
      const product = productBySlug.get(item.slug);
      return product ? { product, qty: item.qty, sum: product.price * item.qty } : null;
    })
    .filter((line): line is { product: Product; qty: number; sum: number } => line !== null);

  const subtotal = lines.reduce((acc, line) => acc + line.sum, 0);
  // «Товары» считаем по старым ценам, разницу показываем строкой «Скидка».
  const gross = lines.reduce((acc, line) => acc + (line.product.oldPrice ?? line.product.price) * line.qty, 0);
  const delivery =
    !method || method === "pickup" || subtotal === 0 || subtotal >= FREE_DELIVERY_FROM ? 0 : DELIVERY_COST;
  return {
    lines,
    gross,
    discount: gross - subtotal,
    subtotal,
    delivery,
    total: subtotal + delivery,
    count: lines.length,
    pieces: lines.reduce((acc, line) => acc + line.qty, 0),
  };
}

export type SortKey = "popular" | "cheap" | "expensive" | "new" | "inStock";

export type CatalogQuery = {
  category?: string;
  brands: string[];
  platforms: string[];
  min?: number;
  max?: number;
  inStock: boolean;
  onSale: boolean;
  power?: "corded" | "cordless";
  sort: SortKey;
  search?: string;
  /** Фасеты по характеристикам товара, ключ — SpecKey, значение — список specSlug. URL: spec.<key>=v1,v2 */
  specs: Record<string, string[]>;
};

export function emptyQuery(): CatalogQuery {
  return { brands: [], platforms: [], inStock: false, onSale: false, sort: "popular", specs: {} };
}

/** Читает фильтры из URL. Состояние живёт в адресе, а не в компоненте. */
export function parseQuery(params: URLSearchParams, category?: string): CatalogQuery {
  const list = (key: string) => params.get(key)?.split(",").filter(Boolean) ?? [];
  const num = (key: string) => {
    const raw = Number(params.get(key));
    return Number.isFinite(raw) && raw > 0 ? raw : undefined;
  };
  const power = params.get("power");
  const sort = params.get("sort");

  const specs: Record<string, string[]> = {};
  for (const [rawKey, value] of params.entries()) {
    if (!rawKey.startsWith("spec.")) continue;
    const values = value.split(",").filter(Boolean);
    if (values.length) specs[rawKey.slice(5)] = values;
  }

  return {
    category,
    brands: list("brand"),
    platforms: list("platform"),
    min: num("min"),
    max: num("max"),
    inStock: params.get("stock") === "1",
    onSale: params.get("sale") === "1",
    power: power === "corded" || power === "cordless" ? power : undefined,
    sort: sort === "cheap" || sort === "expensive" || sort === "new" || sort === "inStock" ? sort : "popular",
    search: params.get("q") ?? undefined,
    specs,
  };
}

export function queryToParams(query: CatalogQuery): URLSearchParams {
  const params = new URLSearchParams();
  if (query.brands.length) params.set("brand", query.brands.join(","));
  if (query.platforms.length) params.set("platform", query.platforms.join(","));
  if (query.min) params.set("min", String(query.min));
  if (query.max) params.set("max", String(query.max));
  if (query.inStock) params.set("stock", "1");
  if (query.onSale) params.set("sale", "1");
  if (query.power) params.set("power", query.power);
  if (query.sort !== "popular") params.set("sort", query.sort);
  if (query.search) params.set("q", query.search);
  for (const [key, values] of Object.entries(query.specs ?? {})) {
    if (values.length) params.set(`spec.${key}`, values.join(","));
  }
  return params;
}

export function applyQuery(query: CatalogQuery): Product[] {
  const needle = query.search?.trim().toLowerCase();
  const specEntries = Object.entries(query.specs ?? {}).filter(([, values]) => values.length);

  // Границы бакетов считаем один раз с той же выборкой (категория), что и в сайдбаре фильтров —
  // иначе спрятанные в URL b0/b1/b2 могли бы не совпасть с тем, что человек видел на экране.
  const categoryScope = query.category ? products.filter((p) => p.category === query.category) : products;
  const numericBucketCache = new Map<string, number[]>();
  for (const [key] of specEntries) {
    if (!NUMERIC_SPEC_KEYS.includes(key as SpecKey)) continue;
    const nums = [...new Set(numericValues(categoryScope, key as SpecKey))].sort((a, b) => a - b);
    numericBucketCache.set(key, numericBoundaries(nums));
  }

  const filtered = products.filter((product) => {
    if (query.category && product.category !== query.category) return false;
    if (query.brands.length && !query.brands.includes(product.brand)) return false;
    if (query.platforms.length && (!product.platform || !query.platforms.includes(product.platform)))
      return false;
    if (query.min && product.price < query.min) return false;
    if (query.max && product.price > query.max) return false;
    if (query.inStock && product.stock === 0) return false;
    if (query.onSale && !product.oldPrice) return false;
    if (query.power && product.power !== query.power) return false;
    for (const [key, values] of specEntries) {
      const entry = product.specs.find(([specKey]) => specKey === key);
      if (!entry) return false;
      const buckets = numericBucketCache.get(key);
      if (buckets) {
        const num = parseNumeric(entry[1], key as SpecKey);
        if (num === null || !values.includes(`b${bucketIndex(num, buckets)}`)) return false;
      } else if (!values.includes(specSlug(entry[1]))) return false;
    }
    if (needle) {
      const haystack = `${product.brand} ${product.model} ${product.sku} ${product.slug}`.toLowerCase();
      if (!haystack.includes(needle)) return false;
    }
    return true;
  });

  const sorted = [...filtered];
  if (query.sort === "cheap") sorted.sort((a, b) => a.price - b.price);
  else if (query.sort === "expensive") sorted.sort((a, b) => b.price - a.price);
  else if (query.sort === "new")
    sorted.sort((a, b) => Number(b.badges.includes("new")) - Number(a.badges.includes("new")));
  else if (query.sort === "inStock")
    sorted.sort((a, b) => Number(b.stock > 0) - Number(a.stock > 0) || b.sold - a.sold);
  else sorted.sort((a, b) => b.sold - a.sold);

  return sorted;
}

/**
 * Дискретные характеристики: значения повторяются буквально (патрон, напряжение — из 2-3 вариантов),
 * поэтому фасет — точное совпадение строки.
 */
export const CATEGORICAL_SPEC_KEYS: SpecKey[] = [
  "chuck",
  "voltage",
  "battery",
  "material",
  "standard",
  "disc",
  "pad",
  "lines",
  "size",
  "pieces",
];

/**
 * Почти непрерывные числовые характеристики: у каждой модели своё значение, точным совпадением
 * фильтр не работает (одна опция — один товар). Группируем в 3 человеческих диапазона.
 * Обороты и вес сюда сознательно не входят — владелец счёл их лишними на фоне остальных фасетов.
 */
export const NUMERIC_SPEC_KEYS: SpecKey[] = ["impact", "power", "torque", "depth", "orbit", "range"];

const NUMERIC_UNITS: Partial<Record<SpecKey, Localized>> = {
  impact: { ua: "Дж", ru: "Дж" },
  power: { ua: "Вт", ru: "Вт" },
  torque: { ua: "Н·м", ru: "Н·м" },
  depth: { ua: "мм", ru: "мм" },
  orbit: { ua: "мм", ru: "мм" },
  range: { ua: "м", ru: "м" },
};

const RANGE_WORDS: Record<Locale, { to: string; over: string }> = {
  ua: { to: "до", over: "понад" },
  ru: { to: "до", over: "свыше" },
};

/**
 * Чем реальный покупатель выбирает товар в этой категории — приоритет для двух фасетов,
 * которые останутся на панели. Категорий без записи (accessories, safety, корень каталога)
 * и категорий, где приоритетный ключ не набрал ≥2 значений, страхует общий фолбэк ниже.
 */
const SPEC_FACET_PRIORITY: Record<string, SpecKey[]> = {
  "rotary-hammers": ["impact", "chuck"],
  drills: ["torque", "voltage"],
  grinders: ["disc", "power"],
  saws: ["disc", "depth"],
  sanders: ["pad", "orbit"],
  measuring: ["range", "lines"],
};

/** Не больше 2 фасетов по характеристикам на панели — иначе сайдбар превращается в стену чекбоксов. */
const MAX_SPEC_FACETS = 2;

/**
 * Канонический id значения характеристики для URL и сравнения — берём украинский текст,
 * запятую (десятичный разделитель) меняем на подчёркивание, чтобы не путать со списком через запятую.
 */
export function specSlug(value: SpecValue): string {
  const text = typeof value === "string" ? value : value.ua;
  return text.trim().replace(/,/g, "_");
}

/**
 * Число из текста характеристики: для большинства диапазонов («0–1100 об/хв») берёт верхнюю
 * границу, но у глубины реза первое число — сам размер, второе — угол («66 мм під 90°»),
 * поэтому для «depth» нужно первое совпадение, а не последнее.
 */
function parseNumeric(value: SpecValue, key: SpecKey): number | null {
  const text = typeof value === "string" ? value : value.ua;
  const matches = text.match(/\d+(?:,\d+)?/g);
  if (!matches) return null;
  const pick = key === "depth" ? matches[0] : matches[matches.length - 1];
  return Number(pick.replace(",", "."));
}

function numericValues(scope: Product[], key: SpecKey): number[] {
  return scope
    .map((product) => product.specs.find(([specKey]) => specKey === key))
    .filter((entry): entry is [SpecKey, SpecValue] => entry !== undefined)
    .map((entry) => parseNumeric(entry[1], key))
    .filter((n): n is number => n !== null);
}

function formatNumeric(n: number): string {
  return Number.isInteger(n) ? String(n) : String(n).replace(".", ",");
}

/**
 * Границы по уникальным значениям (не по товарам) — так каждый из ≤3 бакетов гарантированно
 * непустой, даже если товары в выборке распределены неравномерно.
 */
function numericBoundaries(uniqueSorted: number[]): number[] {
  const bucketCount = Math.min(3, uniqueSorted.length);
  const boundaries: number[] = [];
  for (let i = 1; i < bucketCount; i++) {
    boundaries.push(uniqueSorted[Math.floor((i * uniqueSorted.length) / bucketCount) - 1]);
  }
  return boundaries;
}

function bucketIndex(value: number, boundaries: number[]): number {
  for (let i = 0; i < boundaries.length; i++) if (value <= boundaries[i]) return i;
  return boundaries.length;
}

function bucketLabel(index: number, boundaries: number[], unit: string, locale: Locale): string {
  const words = RANGE_WORDS[locale];
  if (boundaries.length === 0) return unit;
  if (index === 0) return `${words.to} ${formatNumeric(boundaries[0])} ${unit}`;
  if (index === boundaries.length) return `${words.over} ${formatNumeric(boundaries[boundaries.length - 1])} ${unit}`;
  return `${formatNumeric(boundaries[index - 1])}–${formatNumeric(boundaries[index])} ${unit}`;
}

export type SpecFacetOption = { slug: string; label: string; count: number };
export type SpecFacet = { key: SpecKey; options: SpecFacetOption[] };

function numericFacet(scope: Product[], key: SpecKey, locale: Locale): SpecFacet | null {
  const uniqueSorted = [...new Set(numericValues(scope, key))].sort((a, b) => a - b);
  if (uniqueSorted.length < 2) return null;

  const boundaries = numericBoundaries(uniqueSorted);
  const unit = NUMERIC_UNITS[key]?.[locale] ?? "";
  const counts = new Map<number, number>();
  for (const value of numericValues(scope, key)) {
    const index = bucketIndex(value, boundaries);
    counts.set(index, (counts.get(index) ?? 0) + 1);
  }

  const options = [...counts.entries()]
    .sort(([a], [b]) => a - b)
    .map(([index, count]) => ({ slug: `b${index}`, label: bucketLabel(index, boundaries, unit, locale), count }));

  return options.length >= 2 ? { key, options } : null;
}

function categoricalFacet(scope: Product[], key: SpecKey, locale: Locale): SpecFacet | null {
  const byValue = new Map<string, SpecFacetOption>();
  for (const product of scope) {
    const entry = product.specs.find(([specKey]) => specKey === key);
    if (!entry) continue;
    const slug = specSlug(entry[1]);
    const existing = byValue.get(slug);
    if (existing) existing.count += 1;
    else byValue.set(slug, { slug, label: localize(entry[1], locale), count: 1 });
  }
  return byValue.size >= 2 ? { key, options: [...byValue.values()].sort((a, b) => b.count - a.count) } : null;
}

/**
 * Фасеты считаем прямо из product.specs выбранной категории: точные значения для дискретных
 * характеристик, диапазоны для числовых. Показываем группу только там, где в выборке ≥2 значения
 * (для числовых — ≥2 непустых бакета) — иначе фильтр ничего не отсеивает и только шумит.
 *
 * На панели остаётся не больше `MAX_SPEC_FACETS`: сначала берём ключи из `SPEC_FACET_PRIORITY`
 * для этой категории (то, чем реально выбирают товар), а если приоритетный ключ не набрал
 * достаточно значений — или для категории приоритета нет — дополняем первыми подходящими
 * из общего списка.
 */
export function specFacets(scope: Product[], locale: Locale, category?: string): SpecFacet[] {
  const all: SpecFacet[] = [];
  for (const key of CATEGORICAL_SPEC_KEYS) {
    const facet = categoricalFacet(scope, key, locale);
    if (facet) all.push(facet);
  }
  for (const key of NUMERIC_SPEC_KEYS) {
    const facet = numericFacet(scope, key, locale);
    if (facet) all.push(facet);
  }

  const byKey = new Map(all.map((facet) => [facet.key, facet]));
  const priority = (category && SPEC_FACET_PRIORITY[category]) || [];
  const selected: SpecFacet[] = [];
  for (const key of priority) {
    const facet = byKey.get(key);
    if (facet && !selected.includes(facet)) selected.push(facet);
    if (selected.length >= MAX_SPEC_FACETS) break;
  }
  for (const facet of all) {
    if (selected.length >= MAX_SPEC_FACETS) break;
    if (!selected.includes(facet)) selected.push(facet);
  }
  return selected;
}

export function countForPlatform(slug: string): number {
  return products.filter((product) => product.platform === slug).length;
}

export function platformName(slug?: string): string | null {
  return slug ? (platformBySlug.get(slug)?.name ?? null) : null;
}

/** Похожие: та же категория, а если мало — та же платформа. */
export function relatedTo(product: Product, limit = 4): Product[] {
  const sameCategory = products.filter(
    (candidate) => candidate.slug !== product.slug && candidate.category === product.category,
  );
  const samePlatform = product.platform
    ? products.filter(
        (candidate) =>
          candidate.slug !== product.slug &&
          candidate.platform === product.platform &&
          candidate.category !== product.category,
      )
    : [];
  return [...samePlatform, ...sameCategory].slice(0, limit);
}

export function bestsellers(limit = 8): Product[] {
  return [...products].sort((a, b) => b.sold - a.sold).slice(0, limit);
}

export function freshArrivals(limit = 8): Product[] {
  return products
    .filter((product) => product.badges.includes("new"))
    .concat([...products].sort((a, b) => b.price - a.price))
    .slice(0, limit);
}

export function discounted(limit = 8): Product[] {
  return products
    .filter((product) => product.oldPrice)
    .sort((a, b) => (discountPercent(b) ?? 0) - (discountPercent(a) ?? 0))
    .slice(0, limit);
}

export function countIn(category: string): number {
  return products.filter((product) => product.category === category).length;
}
