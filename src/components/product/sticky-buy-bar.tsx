"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n/context";
import { useMounted } from "@/lib/use-mounted";
import { href, price } from "@/lib/shop";
import { setBodyInset } from "@/lib/body-inset";
import { useCart, useCompare } from "@/store/shop";
import { announceAdded, useCartUI } from "@/store/cart-ui";
import { IconCheck } from "@/components/ui/icons";
import type { Product } from "@/data/types";
import { BUY_CTA_ID } from "./buy-box";

/**
 * Phone and tablet sticky bar (<1024px). It watches the BuyBox buy button (013 E, 015), not the
 * price: the bar shows whenever that button is off screen, above or below. On a 390×844 phone the
 * button sits under the fold at first, so the bar is there from the first screen.
 * The button mirrors the cart state of the BuyBox: "У кошик" before adding, "У кошику · N" after,
 * and then leads to the cart (the cart panel on ≥md, /cart on phones), like the header cart.
 * The bar stays in the DOM (translate/opacity only) so its height can be measured and reserved as
 * body padding through lib/body-inset.ts, together with the compare bar.
 */
export function StickyBuyBar({ product }: { product: Product }) {
  const { locale, dict } = useI18n();
  const mounted = useMounted();
  const [hidden, setHidden] = useState(true);
  const [barHeight, setBarHeight] = useState(0);
  const barRef = useRef<HTMLDivElement>(null);

  const add = useCart((state) => state.add);
  const inCart = useCart((state) => state.items.find((item) => item.slug === product.slug));
  const compareCount = useCompare((state) => state.slugs.length);

  useEffect(() => {
    const target = document.getElementById(BUY_CTA_ID);
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => setHidden(entry.isIntersecting));
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Before `mounted` the component returns null and barRef is empty; without `mounted` in the
    // dependencies the height would stay 0, because this effect would not run again.
    const measure = () => setBarHeight(barRef.current?.offsetHeight ?? 0);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [mounted]);

  const show = mounted && !hidden;

  useEffect(() => {
    if (!show || barHeight === 0) return;
    setBodyInset("sticky-buy-bar", barHeight);
    return () => setBodyInset("sticky-buy-bar", 0);
  }, [show, barHeight]);

  if (!mounted) return null;

  const out = product.stock === 0;
  const compareVisible = compareCount > 0;

  return (
    <div
      ref={barRef}
      // inert, not aria-hidden: the hidden bar must not take keyboard focus, and aria-hidden on an
      // ancestor of a focusable element is a violation, not a fix.
      inert={!show}
      className={`fixed inset-x-0 z-30 border-t border-[var(--hair-strong)] bg-ink-900/95 backdrop-blur-xl transition-transform lg:hidden ${
        show ? "translate-y-0" : "pointer-events-none translate-y-full"
      }`}
      style={{ bottom: compareVisible ? "84px" : "0px" }}
    >
      <div className="shell flex items-center gap-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))]">
        <span className="t-price text-xl text-bone">{price(product.price)} ₴</span>
        {inCart ? (
          <Link
            href={href(locale, "/cart")}
            onClick={(event) => {
              if (window.matchMedia("(min-width: 768px)").matches) {
                event.preventDefault();
                useCartUI.getState().show("modal");
              }
            }}
            className="signal-btn btn-sm ml-auto flex-1"
          >
            <IconCheck className="h-4 w-4" />
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
            className="signal-btn btn-sm ml-auto flex-1"
          >
            {out ? dict.stock.out : dict.product.addToCart}
          </button>
        )}
      </div>
    </div>
  );
}
