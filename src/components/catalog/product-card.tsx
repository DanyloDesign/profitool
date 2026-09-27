"use client";

import Image from "next/image";
import { useState } from "react";
import { useMounted } from "@/lib/use-mounted";
import Link from "next/link";
import { useI18n } from "@/i18n/context";
import type { Product } from "@/data/types";
import { brandBySlug, platformBySlug } from "@/data/taxonomy";
import { discountPercent, imageOf, keyValue, price, productHref } from "@/lib/shop";
import { COMPARE_LIMIT, useCart, useCompare, useWishlist } from "@/store/shop";
import { announceAdded } from "@/store/cart-ui";
import { IconCheck, IconCompare, IconHeart } from "@/components/ui/icons";

/** Высота кадра фиксирована по месту: на телефоне ниже, потому что колонок две. */
const frame = {
  home: "h-[200px] md:h-[300px]",
  catalog: "h-[200px] md:h-[280px]",
  rail: "h-[180px] md:h-[220px]",
} as const;

type Props = { product: Product; size?: keyof typeof frame; priority?: boolean; className?: string };

export function ProductCard({ product, size = "catalog", priority, className }: Props) {
  const { locale, dict } = useI18n();
  const mounted = useMounted();
  const add = useCart((state) => state.add);
  const removeFromCart = useCart((state) => state.remove);
  const inCart = useCart((state) => state.items.some((item) => item.slug === product.slug));
  const [armed, setArmed] = useState(true);
  const toggleCompare = useCompare((state) => state.toggle);
  const compareSlugs = useCompare((state) => state.slugs);
  const toggleWish = useWishlist((state) => state.toggle);
  const wishSlugs = useWishlist((state) => state.slugs);

  const brand = brandBySlug.get(product.brand)?.name ?? product.brand;
  const name = `${brand} ${product.model}`;
  const discount = discountPercent(product);
  const out = product.stock === 0;
  const inCompare = mounted && compareSlugs.includes(product.slug);
  const compareFull = mounted && compareSlugs.length >= COMPARE_LIMIT && !inCompare;
  const wished = mounted && wishSlugs.includes(product.slug);
  const added = mounted && inCart;

  const platform = product.platform ? platformBySlug.get(product.platform)?.name : undefined;
  const powerLabel =
    product.power === "corded"
      ? dict.catalog.cordedOne
      : product.power === "cordless"
        ? dict.catalog.cordlessOne
        : undefined;
  const meta = [keyValue(product, locale), platform ?? powerLabel].filter(Boolean).join(" · ");

  return (
    <article className={`group relative flex h-full flex-col ${className ?? ""}`}>
      <Link href={productHref(locale, product.slug)} className="relative block">
        <span className={`relative block ${frame[size]}`}>
          <Image
            src={imageOf(product)}
            alt={name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 320px"
            priority={priority}
            className={`object-contain transition-transform duration-500 group-hover:scale-105 ${
              out ? "opacity-55" : ""
            }`}
          />
        </span>
      </Link>

      {discount ? (
        <span className="pointer-events-none absolute left-0 top-0 inline-flex h-[26px] items-center rounded-full bg-signal px-2.5 text-[13px] font-semibold text-black">
          −{discount}%
        </span>
      ) : product.badges.includes("new") ? (
        <span className="pointer-events-none absolute left-0 top-0 inline-flex h-[26px] items-center rounded-full border border-signal px-2.5 text-[13px] font-medium text-signal-text">
          {dict.common.new}
        </span>
      ) : null}

      <div className="absolute right-0 top-0 flex">
        <button
          type="button"
          onClick={() => toggleCompare(product.slug)}
          disabled={compareFull}
          aria-pressed={inCompare}
          aria-label={inCompare ? dict.product.compareRemove(name) : dict.product.compareAdd(name)}
          className="icon-btn disabled:opacity-40"
        >
          <IconCompare className="h-5 w-5" gradient={inCompare} />
        </button>
        <button
          type="button"
          onClick={() => toggleWish(product.slug)}
          aria-pressed={wished}
          aria-label={wished ? dict.product.wishlistRemove(name) : dict.product.wishlistAdd(name)}
          className="icon-btn"
        >
          <IconHeart className="h-5 w-5" filled={wished} gradient={wished} />
        </button>
      </div>

      <div className={`mt-3.5 flex flex-1 flex-col ${out ? "opacity-55" : ""}`}>
        <span className="text-sm text-bone-dim">{brand}</span>
        <Link
          href={productHref(locale, product.slug)}
          className="mt-1 text-[19px] font-medium leading-snug text-bone transition-colors hover:text-signal-text"
        >
          {product.model}
        </Link>
        <span className="mt-1 text-sm text-bone-dim">{meta}</span>

        <div className="mt-3 flex flex-wrap items-baseline gap-x-3">
          <span className="t-price text-2xl text-bone">{price(product.price)} ₴</span>
          {product.oldPrice ? (
            <span className="text-[15px] text-bone-dim line-through">{price(product.oldPrice)}</span>
          ) : null}
        </div>
      </div>

      {!out && product.stock <= 5 ? (
        <span className="mt-1.5 text-sm text-signal-text">{dict.stock.low(product.stock)}</span>
      ) : null}

      <button
        type="button"
        onClick={() => {
          if (added) {
            removeFromCart(product.slug);
          } else {
            add(product.slug);
            announceAdded();
          }
          setArmed(false);
        }}
        onPointerLeave={() => setArmed(true)}
        disabled={out}
        data-state={added ? "added" : undefined}
        data-armed={added && armed ? "" : undefined}
        aria-label={added ? `${dict.product.inCart}. ${dict.cart.removeItem(name)}` : undefined}
        className="tint-btn group/cart mt-4 w-full"
      >
        {out ? (
          dict.stock.out
        ) : added ? (
          <>
            <span
              className={`inline-flex items-center gap-[0.6em] ${
                armed ? "group-hover/cart:hidden group-focus-visible/cart:hidden" : ""
              }`}
            >
              <IconCheck className="h-[18px] w-[18px]" />
              {dict.product.inCart}
            </span>
            {armed ? (
              <span className="hidden group-hover/cart:inline group-focus-visible/cart:inline">{dict.product.removeFromCart}</span>
            ) : null}
          </>
        ) : (
          dict.product.addToCart
        )}
      </button>
    </article>
  );
}
