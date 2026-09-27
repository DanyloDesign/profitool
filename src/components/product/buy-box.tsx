"use client";

import Link from "next/link";
import { useMounted } from "@/lib/use-mounted";
import { useI18n } from "@/i18n/context";
import type { Product } from "@/data/types";
import { kitBattery, kitKind } from "@/data/products";
import { brandBySlug, platformBySlug } from "@/data/taxonomy";
import { discountPercent, href, price } from "@/lib/shop";
import { COMPARE_LIMIT, useCart, useCompare, usePlatform, useWishlist } from "@/store/shop";
import { announceAdded, useCartUI } from "@/store/cart-ui";
import { IconCheck, IconCompare, IconHeart } from "@/components/ui/icons";

/** The sticky phone bar watches this element: it shows as soon as the buy button leaves the screen. */
export const BUY_CTA_ID = "buy-box-cta";

/**
 * Price, stock, the kit line and the buy button (015). Wishlist and compare sit next to the button
 * as icon buttons, so the column that decides the purchase stays short enough to stick.
 */
export function BuyBox({ product }: { product: Product }) {
  const { locale, dict } = useI18n();
  const mounted = useMounted();

  const add = useCart((state) => state.add);
  const inCart = useCart((state) => state.items.find((item) => item.slug === product.slug));
  const toggleCompare = useCompare((state) => state.toggle);
  const compareSlugs = useCompare((state) => state.slugs);
  const toggleWish = useWishlist((state) => state.toggle);
  const wishSlugs = useWishlist((state) => state.slugs);

  const out = product.stock === 0;
  const discount = discountPercent(product);
  const inCompare = mounted && compareSlugs.includes(product.slug);
  const compareFull = mounted && compareSlugs.length >= COMPARE_LIMIT && !inCompare;
  const wished = mounted && wishSlugs.includes(product.slug);
  const name = `${brandBySlug.get(product.brand)?.name ?? product.brand} ${product.model}`;

  return (
    <div>
      {/* id kept: other code may still look for the price block. The sticky bar watches the button. */}
      <div id="buy-box-price" className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span className="t-price pdp-price text-bone">{price(product.price)} ₴</span>
        {product.oldPrice ? (
          <span className="text-lg text-bone-dim line-through">{price(product.oldPrice)}</span>
        ) : null}
        {discount ? (
          <span className="inline-flex h-7 items-center self-center rounded-full bg-signal px-3 text-sm font-semibold text-black">
            −{discount}%
          </span>
        ) : null}
        <Availability product={product} />
      </div>

      <KitLine product={product} />

      <div id={BUY_CTA_ID} className="mt-6 flex items-stretch gap-3">
        {mounted && inCart ? (
          // Already in the cart: the button leads where the header cart leads (the cart panel on
          // ≥md, the /cart page on phones).
          <Link
            href={href(locale, "/cart")}
            onClick={(event) => {
              if (window.matchMedia("(min-width: 768px)").matches) {
                event.preventDefault();
                useCartUI.getState().show("modal");
              }
            }}
            className="signal-btn min-w-0 flex-1"
          >
            <IconCheck className="h-5 w-5" />
            {dict.product.inCart} · {inCart.qty}
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => {
              add(product.slug, 1);
              announceAdded();
            }}
            disabled={out}
            className="signal-btn min-w-0 flex-1"
          >
            {out ? dict.stock.out : dict.product.addToCart}
          </button>
        )}
        <button
          type="button"
          onClick={() => toggleWish(product.slug)}
          aria-pressed={wished}
          aria-label={wished ? dict.product.wishlistRemove(name) : dict.product.wishlistAdd(name)}
          title={wished ? dict.product.inWishlist : dict.product.addToWishlist}
          className="ghost-btn w-13 shrink-0 !px-0"
        >
          <IconHeart className="h-5 w-5" filled={wished} gradient={wished} />
        </button>
        <button
          type="button"
          onClick={() => toggleCompare(product.slug)}
          disabled={compareFull}
          aria-pressed={inCompare}
          aria-label={inCompare ? dict.product.compareRemove(name) : dict.product.compareAdd(name)}
          title={compareFull ? dict.compare.limit : inCompare ? dict.product.inCompare : dict.product.compare}
          className="ghost-btn w-13 shrink-0 !px-0"
        >
          <IconCompare className="h-5 w-5" gradient={inCompare} />
        </button>
      </div>
    </div>
  );
}

/**
 * One calm line under the price about what powers the tool (015, kit truth). Bare tools say so
 * and name the platform; once the buyer's own platform matches, the line turns stock green.
 * Nothing for corded tools and accessories.
 */
function KitLine({ product }: { product: Product }) {
  const { locale, dict } = useI18n();
  const mounted = useMounted();
  const myPlatform = usePlatform((state) => state.slug);

  const kind = kitKind(product);
  if (kind === "plain") return null;

  const platform = product.platform ? platformBySlug.get(product.platform) : undefined;
  const platformName = platform ? `${brandBySlug.get(platform.brand)?.name ?? ""} ${platform.name}`.trim() : "";

  let lead: string;
  let rest = "";
  let tone: string;
  if (kind === "withBattery") {
    const battery = kitBattery(product)?.[locale] ?? "";
    lead = dict.pdp.kitIncluded(battery.charAt(0).toLowerCase() + battery.slice(1));
    tone = "text-stock";
  } else {
    const fits = mounted && !!myPlatform && myPlatform === product.platform;
    lead = dict.pdp.kitBare;
    if (platformName) rest = fits ? dict.pdp.kitFits(platformName) : dict.pdp.kitWorksWith(platformName);
    tone = fits ? "text-stock" : "text-signal-text";
  }

  return (
    <p className={`pdp-line mt-3 flex gap-2.5 ${tone}`}>
      <BoxIcon />
      <span>
        <span className="font-medium">{lead}</span>
        {rest ? <> {rest}</> : null}
      </span>
    </p>
  );
}

function BoxIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="mt-px h-5 w-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 8l8-4 8 4v8l-8 4-8-4z" />
      <path d="M4 8l8 4 8-4M12 12v8" />
    </svg>
  );
}

function Availability({ product }: { product: Product }) {
  const { dict } = useI18n();

  // No "we'll let you know" here: the shop has no restock notice (CLAUDE.md, left out on purpose).
  const state =
    product.stock === 0
      ? { dot: "bg-bone-faint", text: dict.stock.out, color: "text-bone-dim" }
      : product.stock <= 5
        ? { dot: "bg-signal", text: dict.stock.low(product.stock), color: "text-signal-text" }
        : { dot: "bg-stock", text: dict.stock.in, color: "text-bone" };

  return (
    <span className={`pdp-line inline-flex items-center gap-2 ${state.color}`}>
      <span className={`h-2 w-2 shrink-0 rounded-full ${state.dot}`} aria-hidden />
      {state.text}
    </span>
  );
}
