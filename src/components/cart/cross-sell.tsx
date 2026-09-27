"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/i18n/context";
import { useMounted } from "@/lib/use-mounted";
import { brandBySlug } from "@/data/taxonomy";
import { productBySlug, products } from "@/data/products";
import type { Product } from "@/data/types";
import { imageOf, price, productHref } from "@/lib/shop";
import { announceAdded } from "@/store/cart-ui";
import { useCart, type CartItem } from "@/store/shop";
import { IconPlus } from "@/components/ui/icons";

// Категорії, для яких «Оснастка» — це біти/свердла (не диски).
const BIT_CATEGORIES = new Set(["rotary-hammers", "drills"]);
// Категорії, для яких «Оснастка» — це відрізні/шліфувальні диски.
const DISC_CATEGORIES = new Set(["grinders", "saws"]);
// Категорії, для яких підходить будь-яка оснастка (профільної немає в каталозі).
const GENERIC_ACCESSORY_CATEGORIES = new Set(["sanders"]);

/** Диск відрізняємо від бітів/свердел за характеристикою "disc" у specs товару. */
function isDisc(product: Product): boolean {
  return product.specs.some(([key]) => key === "disc");
}

/**
 * Допродажа — доповнення, а не конкуренти: інструмент того самого призначення в кошику
 * ніколи не пропонуємо повторно, лише сумісну оснастку й засоби захисту. Немає підходящого —
 * блок ховається (порожній масив), а не показує будь-що з каталогу.
 */
function pickCrossSell(items: CartItem[], limit = 2): Product[] {
  const cartSlugs = new Set(items.map((item) => item.slug));
  const cartProducts = items
    .map((item) => productBySlug.get(item.slug))
    .filter((p): p is Product => Boolean(p));

  const cartCategories = new Set(cartProducts.map((p) => p.category));

  let wantBits = false;
  let wantDiscs = false;
  let wantGenericAccessories = false;
  let wantSafety = false;

  for (const category of cartCategories) {
    if (BIT_CATEGORIES.has(category)) {
      wantBits = true;
      wantSafety = true;
    } else if (DISC_CATEGORIES.has(category)) {
      wantDiscs = true;
      wantSafety = true;
    } else if (GENERIC_ACCESSORY_CATEGORIES.has(category)) {
      wantGenericAccessories = true;
      wantSafety = true;
    } else if (category === "accessories") {
      wantSafety = true;
    }
    // "measuring" і "safety" самі по собі нічого не тягнуть за собою.
  }

  const excluded = (product: Product) =>
    cartSlugs.has(product.slug) || product.stock === 0 || cartCategories.has(product.category);

  const accessoryPool = products.filter((product) => {
    if (excluded(product) || product.category !== "accessories") return false;
    if (wantGenericAccessories) return true;
    if (wantBits) return !isDisc(product);
    if (wantDiscs) return isDisc(product);
    return false;
  });
  const safetyPool = wantSafety
    ? products.filter((product) => !excluded(product) && product.category === "safety")
    : [];

  const bySold = (a: Product, b: Product) => b.sold - a.sold;
  const bestAccessory = [...accessoryPool].sort(bySold)[0];
  const bestSafety = [...safetyPool].sort(bySold)[0];

  // Одна оснастка + один засіб захисту, а не два найпопулярніші з одного пулу:
  // "hammer -> SDS-біти + захист" мусить показати саме різне, а не два набори бітів.
  const picks = [bestAccessory, bestSafety].filter((p): p is Product => Boolean(p));
  if (picks.length < limit) {
    const rest = [...accessoryPool, ...safetyPool]
      .filter((product) => !picks.some((picked) => picked.slug === product.slug))
      .sort(bySold);
    picks.push(...rest.slice(0, limit - picks.length));
  }

  return picks.slice(0, limit);
}

export function CrossSell() {
  const { locale, dict } = useI18n();
  const mounted = useMounted();
  const items = useCart((state) => state.items);
  const add = useCart((state) => state.add);

  if (!mounted || items.length === 0) return null;
  const picks = pickCrossSell(items);
  if (picks.length === 0) return null;

  return (
    <section aria-label={dict.cart.crossSellTitle} className="mt-10 border-t border-[var(--hair)] pt-8">
      <h2 className="t-h3 text-bone">{dict.cart.crossSellTitle}</h2>
      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {picks.map((product) => {
          const brand = brandBySlug.get(product.brand)?.name ?? product.brand;
          const name = `${brand} ${product.model}`;
          return (
            <div key={product.slug} className="flex items-center gap-4">
              <Link href={productHref(locale, product.slug)} className="relative block h-[72px] w-[72px] shrink-0">
                <Image src={imageOf(product)} alt={name} fill sizes="72px" className="object-contain" />
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  href={productHref(locale, product.slug)}
                  className="block truncate text-[15px] font-medium text-bone transition-colors hover:text-signal-text"
                >
                  {name}
                </Link>
                <span className="t-price mt-0.5 block text-base text-bone">{price(product.price)} ₴</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  add(product.slug);
                  announceAdded();
                }}
                aria-label={dict.cart.crossSellAdd(name)}
                className="icon-btn shrink-0 border border-[var(--hair-strong)] hover:border-signal hover:text-signal-text"
              >
                <IconPlus className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
