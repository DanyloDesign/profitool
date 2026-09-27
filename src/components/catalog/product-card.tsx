"use client";

import Image from "next/image";
import { Fragment, useState, useSyncExternalStore } from "react";
import { useMounted } from "@/lib/use-mounted";
import Link from "next/link";
import { useI18n } from "@/i18n/context";
import type { Locale } from "@/i18n";
import type { Product } from "@/data/types";
import { brandBySlug, platformBySlug } from "@/data/taxonomy";
import { kitBattery, kitKind, kitNoBattery, type KitKind } from "@/data/products";
import { revealSpecs, shortOf } from "@/lib/card";
import { discountPercent, imageOf, keyValue, price, productHref } from "@/lib/shop";
import { COMPARE_LIMIT, useCart, useCompare, usePlatform, useWishlist } from "@/store/shop";
import { announceAdded } from "@/store/cart-ui";
import { IconCheck, IconCompare, IconHeart } from "@/components/ui/icons";
import { IconBox } from "./icon-box";

/** Высота кадра фиксирована по месту: на телефоне ниже, потому что колонок две. */
const frame = {
  home: "h-[200px] md:h-[300px]",
  catalog: "h-[200px] md:h-[292px]",
  rail: "h-[180px] md:h-[220px]",
} as const;

type Props = { product: Product; size?: keyof typeof frame; priority?: boolean; className?: string };

/**
 * 015: the hover reveal needs a pointer that can hover and room for three spec rows. Touch screens
 * and narrow windows keep the resting card; its key line carries the essentials. The same query
 * gates the reveal styles in globals.css (block "015 product card").
 */
const REVEAL_QUERY = "(hover: hover) and (pointer: fine) and (min-width: 1024px)";

function subscribeReveal(onChange: () => void) {
  const query = window.matchMedia(REVEAL_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
const canRevealNow = () => window.matchMedia(REVEAL_QUERY).matches;
const canRevealOnServer = () => false;

/** The manual comes with every tool, so the kit line skips it when there is anything else. */
const MANUAL_UA = "Інструкція та гарантійний талон";

const kitTone: Record<KitKind, string> = {
  bare: "text-signal-text",
  withBattery: "text-stock",
  plain: "text-bone-dim",
};

/** One line on what is in the box: no battery, the battery, or the first two kit items. */
function kitLine(product: Product, locale: Locale): { kind: KitKind; text: string } | null {
  const kind = kitKind(product);
  if (kind === "bare") return { kind, text: kitNoBattery[locale] };
  if (kind === "withBattery") {
    const battery = kitBattery(product);
    return battery ? { kind, text: battery[locale] } : null;
  }
  const items = product.kit.filter((item) => item.ua !== MANUAL_UA);
  const shown = (items.length ? items : product.kit).slice(0, 2).map((item, index) => {
    const text = item[locale];
    return index === 0 ? text : text.charAt(0).toLocaleLowerCase(locale === "ua" ? "uk" : "ru") + text.slice(1);
  });
  return shown.length ? { kind, text: shown.join(" · ") } : null;
}

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
  const myPlatform = usePlatform((state) => state.slug);

  // Reveal state: open while a mouse is over the card or keyboard focus is inside it; Esc closes
  // it until the pointer and the focus have both left the card (WCAG 1.4.13).
  const canReveal = useSyncExternalStore(subscribeReveal, canRevealNow, canRevealOnServer);
  const [hovered, setHovered] = useState(false);
  const [keyFocus, setKeyFocus] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const open = canReveal && (hovered || keyFocus) && !dismissed;

  const brand = brandBySlug.get(product.brand)?.name ?? product.brand;
  const name = `${brand} ${product.model}`;
  const discount = discountPercent(product);
  const out = product.stock === 0;
  const inCompare = mounted && compareSlugs.includes(product.slug);
  const compareFull = mounted && compareSlugs.length >= COMPARE_LIMIT && !inCompare;
  const wished = mounted && wishSlugs.includes(product.slug);
  const added = mounted && inCart;
  const compatible = mounted && !!product.platform && myPlatform === product.platform;
  const bare = kitKind(product) === "bare";

  const platform = product.platform ? platformBySlug.get(product.platform)?.name : undefined;
  const powerLabel =
    product.power === "corded"
      ? dict.catalog.cordedOne
      : product.power === "cordless"
        ? dict.catalog.cordlessOne
        : undefined;
  const meta = [keyValue(product, locale), platform ?? powerLabel].filter(Boolean).join(" · ");

  const short = canReveal ? shortOf(product, locale) : "";
  // The rail frame (220px) holds the short line and the kit line, not the spec rows.
  const specs = canReveal && size !== "rail" ? revealSpecs(product, locale) : [];
  const kit = canReveal ? kitLine(product, locale) : null;

  return (
    <article
      className={`pcard group relative flex h-full flex-col ${className ?? ""}`}
      data-size={size}
      data-open={open ? "" : undefined}
      onPointerEnter={(event) => {
        if (event.pointerType !== "touch") setHovered(true);
      }}
      onPointerLeave={() => {
        setHovered(false);
        if (!keyFocus) setDismissed(false);
      }}
      onFocus={(event) => setKeyFocus(event.target.matches(":focus-visible"))}
      onBlur={(event) => {
        if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
        setKeyFocus(false);
        if (!hovered) setDismissed(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) setDismissed(true);
      }}
    >
      <div className={`pcard-frame relative ${frame[size]}`}>
        <Link href={productHref(locale, product.slug)} className="absolute inset-0 block rounded-[18px]">
          <span className="pcard-photo absolute inset-0 block">
            <Image
              src={imageOf(product)}
              alt={name}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 320px"
              priority={priority}
              className={`object-contain ${out ? "opacity-55" : ""}`}
            />
          </span>
        </Link>

        {/* Badge and tools sit in the frame's corners; from 1024px they step in so the reveal's
            rounded surface does not clip them. */}
        {discount ? (
          <span className="pointer-events-none absolute left-0 top-0 inline-flex h-7 items-center rounded-full bg-signal px-2.5 text-sm font-semibold text-black lg:left-3 lg:top-3">
            −{discount}%
          </span>
        ) : product.badges.includes("new") ? (
          <span className="pointer-events-none absolute left-0 top-0 inline-flex h-7 items-center rounded-full border border-signal bg-ink-900 px-2.5 text-sm font-medium text-signal-text lg:left-3 lg:top-3">
            {dict.common.new}
          </span>
        ) : null}

        <div className="absolute right-0 top-0 flex lg:right-1 lg:top-1">
          <button
            type="button"
            onClick={() => toggleCompare(product.slug)}
            disabled={compareFull}
            aria-pressed={inCompare}
            aria-label={inCompare ? dict.product.compareRemove(name) : dict.product.compareAdd(name)}
            className="pcard-tool icon-btn"
          >
            <IconCompare className="h-5 w-5" gradient={inCompare} />
          </button>
          <button
            type="button"
            onClick={() => toggleWish(product.slug)}
            aria-pressed={wished}
            aria-label={wished ? dict.product.wishlistRemove(name) : dict.product.wishlistAdd(name)}
            className="pcard-tool icon-btn"
          >
            <IconHeart className="h-5 w-5" filled={wished} gradient={wished} />
          </button>
        </div>

        {canReveal ? (
          <div className="pcard-reveal absolute inset-x-3.5 bottom-3.5 flex flex-col gap-2" aria-hidden={!open}>
            <p className="line-clamp-2 text-[15px] leading-5 text-bone">{short}</p>
            {specs.length ? (
              <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 text-sm leading-5">
                {specs.map((spec) => (
                  <Fragment key={spec.key}>
                    <dt className="whitespace-nowrap text-bone-dim">{spec.label}</dt>
                    <dd className="truncate text-right font-medium text-bone">{spec.value}</dd>
                  </Fragment>
                ))}
              </dl>
            ) : null}
            {kit ? (
              <p className={`flex items-center gap-2 text-sm font-medium leading-5 ${kitTone[kit.kind]}`}>
                <IconBox className="h-[18px] w-[18px] shrink-0" />
                <span className="truncate">{kit.text}</span>
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className={`mt-3.5 flex flex-1 flex-col ${out ? "opacity-55" : ""}`}>
        <span className="flex flex-wrap items-center gap-x-2 text-sm text-bone-dim">
          <span>{brand}</span>
          {compatible ? (
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap font-medium text-stock">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-stock" />
              {dict.card.compatible}
            </span>
          ) : null}
        </span>
        <Link
          href={productHref(locale, product.slug)}
          className="mt-1 text-[19px] font-medium leading-snug text-bone transition-colors hover:text-signal-text"
        >
          {product.model}
        </Link>
        {/* One line: the key figure and the platform may truncate, "без АКБ" never does. */}
        <span className="mt-1 flex min-w-0 gap-1 text-sm text-bone-dim">
          <span className="truncate">{meta}</span>
          {bare ? <span className="shrink-0 whitespace-nowrap text-signal-text">· {dict.card.bare}</span> : null}
        </span>

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
