"use client";

import Image from "next/image";
import Link from "next/link";
import { createPortal } from "react-dom";
import { useEffect, useId, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { usePathname } from "next/navigation";
import { useI18n } from "@/i18n/context";
import type { Locale } from "@/i18n";
import { brandBySlug } from "@/data/taxonomy";
import { kitBattery, kitKind, kitNoBattery, productBySlug } from "@/data/products";
import type { Product } from "@/data/types";
import { FREE_DELIVERY_FROM, href, imageOf, keyValue, orderTotals, price, productHref } from "@/lib/shop";
import { useMounted } from "@/lib/use-mounted";
import { useCart, type CartItem } from "@/store/shop";
import { announceAdded, useCartUI } from "@/store/cart-ui";
import { pickCrossSell } from "@/components/cart/cross-sell";
import { IconCart, IconCheck, IconClose, IconMinus, IconPlus } from "@/components/ui/icons";

const FOCUSABLE = 'a[href], button:not(:disabled), input:not(:disabled), [tabindex]:not([tabindex="-1"])';
/** A downward drag on the phone sheet's handle longer than this closes it. */
const DRAG_CLOSE_PX = 96;
/** Unmounts the drawer if `animationend` never arrives (animations switched off in the browser). */
const SETTLE_FALLBACK_MS = 600;

function fullName(product: Product): string {
  return `${brandBySlug.get(product.brand)?.name ?? product.brand} ${product.model}`;
}

/** The kit line under the model: the calm kit truth for cordless tools, the key figure otherwise. */
function kitLine(product: Product, locale: Locale): { text: string; tone: string } {
  const kind = kitKind(product);
  if (kind === "bare") return { text: kitNoBattery[locale], tone: "text-signal-text" };
  const battery = kind === "withBattery" ? kitBattery(product) : undefined;
  if (battery) return { text: battery[locale], tone: "text-stock" };
  return { text: keyValue(product, locale), tone: "text-bone-dim" };
}

/**
 * Cart drawer (015): the answer to "У кошик" and to the header cart pill. A right panel from
 * 768px, a bottom sheet with a grab handle below it. Mounted once in the locale layout; the panel
 * goes through a portal because the header's blur layer would trap `position: fixed`.
 *
 * Opened by `announceAdded()` / `useCartUI().show()`. It never closes by itself: Esc, the scrim,
 * the close button, "Продовжити покупки", a link inside it or a page change close it. While open
 * it is a modal dialog: focus moves to the close button, Tab stays inside, the page does not
 * scroll, and focus goes back to whatever had it before. When closed it is not in the DOM.
 *
 * The screen reader live region lives here too, outside the portal, so the two header pills
 * never announce twice.
 */
export function CartDrawer() {
  const mounted = useMounted();
  const phase = useCartUI((state) => state.phase);
  const pathname = usePathname();
  const lastPath = useRef(pathname);

  // A page change (a link inside the drawer, the back button) closes it.
  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    useCartUI.getState().close();
  }, [pathname]);

  return (
    <>
      <CartAnnouncer />
      {mounted && phase !== "closed" ? createPortal(<DrawerPanel closing={phase === "closing"} />, document.body) : null}
    </>
  );
}

/** "Додано в кошик: …" / "Прибрано з кошика: …" for screen readers, on every change of the cart. */
function CartAnnouncer() {
  const { dict } = useI18n();
  const [message, setMessage] = useState("");

  useEffect(
    () =>
      useCart.subscribe((state, prev) => {
        // Rehydration from localStorage is not a change the buyer made.
        if (!useCart.persist.hasHydrated()) return;
        const next = describeChange(prev.items, state.items);
        if (!next) return;
        const product = productBySlug.get(next.slug);
        if (!product) return;
        const name = fullName(product);
        setMessage(
          next.kind === "added"
            ? dict.cart.added(name)
            : next.kind === "removed"
              ? dict.cart.removed(name)
              : `${name}, ${dict.drawer.qty(next.qty)}`,
        );
      }),
    [dict],
  );

  return (
    <span role="status" aria-live="polite" className="sr-only">
      {message}
    </span>
  );
}

type Change = { kind: "added" | "removed" | "qty"; slug: string; qty: number };

/** One change per update is enough: every cart action touches one line. */
function describeChange(before: CartItem[], after: CartItem[]): Change | null {
  const added = after.find((item) => !before.some((old) => old.slug === item.slug));
  if (added) return { kind: "added", slug: added.slug, qty: added.qty };
  const removed = before.find((item) => !after.some((now) => now.slug === item.slug));
  if (removed) return { kind: "removed", slug: removed.slug, qty: 0 };
  const changed = after.find((item) => before.some((old) => old.slug === item.slug && old.qty !== item.qty));
  return changed ? { kind: "qty", slug: changed.slug, qty: changed.qty } : null;
}

type PendingFocus = { kind: "removed"; index: number } | { kind: "newest" };

function DrawerPanel({ closing }: { closing: boolean }) {
  const { locale, dict } = useI18n();
  const mode = useCartUI((state) => state.mode);
  const close = useCartUI((state) => state.close);
  const settle = useCartUI((state) => state.settle);
  const items = useCart((state) => state.items);
  const setQty = useCart((state) => state.setQty);
  const remove = useCart((state) => state.remove);
  const add = useCart((state) => state.add);

  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const pendingFocus = useRef<PendingFocus | null>(null);
  const drag = useRef<{ pointer: number; startY: number; dy: number } | null>(null);

  const open = !closing;
  const { lines, subtotal, pieces } = orderTotals(items);
  // Newest first: the store appends new slugs at the end.
  const newestFirst = [...lines].reverse();
  const empty = newestFirst.length === 0;
  const added = mode === "added" && !empty;
  const suggestion = empty ? undefined : pickCrossSell(items, 1)[0];
  const left = Math.max(0, FREE_DELIVERY_FROM - subtotal);
  const progress = Math.min(100, (subtotal / FREE_DELIVERY_FROM) * 100);

  // Modal behaviour while open: scroll lock, focus in, Tab trap, Esc, focus back on close.
  useEffect(() => {
    if (!open) return undefined;
    const panel = panelRef.current;
    // Reopened while sliding out after a drag: drop the offset the finger left behind.
    panel?.style.removeProperty("transform");
    panel?.style.removeProperty("transition");
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const root = document.documentElement;
    const saved = { overflow: root.style.overflow, gutter: root.style.scrollbarGutter };
    // The gutter stays reserved, so the page does not jump sideways when its scrollbar goes.
    root.style.overflow = "hidden";
    root.style.scrollbarGutter = "stable";
    closeRef.current?.focus({ preventScroll: true });

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab" || !panel) return;
      const focusable = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (node) => node.getClientRects().length > 0,
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (!panel.contains(active)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      root.style.overflow = saved.overflow;
      root.style.scrollbarGutter = saved.gutter;
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, [open, close]);

  useEffect(() => {
    if (!closing) return undefined;
    const timer = setTimeout(settle, SETTLE_FALLBACK_MS);
    return () => clearTimeout(timer);
  }, [closing, settle]);

  // After a removal or a cross-sell add the focused button is gone: put focus somewhere useful.
  useEffect(() => {
    const pending = pendingFocus.current;
    if (!pending) return;
    pendingFocus.current = null;
    const rows = listRef.current?.querySelectorAll<HTMLElement>("li");
    if (!rows || rows.length === 0) {
      closeRef.current?.focus();
      return;
    }
    if (pending.kind === "newest") {
      rows[0].querySelector<HTMLElement>("a[data-line-name]")?.focus();
      return;
    }
    const row = rows[Math.min(pending.index, rows.length - 1)];
    row.querySelector<HTMLElement>("button[data-line-remove]")?.focus();
  }, [items]);

  const removeLine = (slug: string, index: number) => {
    pendingFocus.current = { kind: "removed", index };
    useCartUI.setState({ mode: "cart" });
    remove(slug);
  };

  const addSuggestion = (slug: string) => {
    pendingFocus.current = { kind: "newest" };
    add(slug);
    announceAdded();
  };

  // Phone sheet: drag the handle down to close. The close button keeps working as a button.
  const onDragStart = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!window.matchMedia("(max-width: 767px)").matches) return;
    if ((event.target as HTMLElement).closest("button, a")) return;
    drag.current = { pointer: event.pointerId, startY: event.clientY, dy: 0 };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onDragMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    const panel = panelRef.current;
    if (!state || state.pointer !== event.pointerId || !panel) return;
    state.dy = Math.max(0, event.clientY - state.startY);
    panel.style.transition = "none";
    panel.style.transform = `translateY(${state.dy}px)`;
  };
  const onDragEnd = () => {
    const state = drag.current;
    const panel = panelRef.current;
    drag.current = null;
    if (!state || !panel) return;
    if (state.dy > DRAG_CLOSE_PX) {
      // The slide-out animation starts from where the finger left the sheet.
      close();
      return;
    }
    panel.style.transition = "transform var(--dur-panel-out) var(--ease-std)";
    panel.style.transform = "";
  };

  const newest = newestFirst[0];

  return (
    <div className="cart-drawer" data-state={closing ? "closing" : "open"} inert={closing}>
      <div className="cart-drawer-scrim" aria-hidden onClick={close} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={
          added && newest ? `${titleId}-${newest.product.slug} ${titleId}-${newest.product.slug}-kit` : undefined
        }
        className="cart-drawer-panel"
        onAnimationEnd={(event) => {
          if (closing && event.target === event.currentTarget) settle();
        }}
      >
        <div
          className="cart-drawer-grip"
          onPointerDown={onDragStart}
          onPointerMove={onDragMove}
          onPointerUp={onDragEnd}
          onPointerCancel={onDragEnd}
        >
          <span aria-hidden className="cart-drawer-handle" />
          <div className="mx-4 flex h-14 items-center justify-between gap-3 border-b border-[var(--hair)] md:mx-0 md:h-[76px] md:pl-7 md:pr-4">
            <h2 id={titleId} className="flex min-w-0 items-center gap-2.5 text-lg font-semibold text-bone">
              {added ? <IconCheck className="h-5 w-5 shrink-0 text-stock" strokeWidth={2.2} /> : null}
              <span className="truncate">{added ? dict.drawer.title : dict.drawer.cartTitle}</span>
            </h2>
            <button
              ref={closeRef}
              type="button"
              onClick={close}
              aria-label={dict.drawer.close}
              className="icon-btn -mr-2.5 shrink-0 !text-bone md:mr-0"
            >
              <IconClose className="h-5 w-5" />
            </button>
          </div>
        </div>

        {empty ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-14 text-center">
            <IconCart className="h-10 w-10 text-bone-faint" strokeWidth={1.2} />
            <p className="t-h3 text-bone">{dict.drawer.empty}</p>
            <p className="text-base text-bone-dim">{dict.drawer.emptyText}</p>
            <Link href={href(locale, "/catalog")} onClick={close} className="signal-btn mt-3">
              {dict.drawer.emptyCta}
            </Link>
          </div>
        ) : (
          <>
            <div className="cart-drawer-body">
              <ul ref={listRef} aria-label={dict.drawer.lines}>
                {newestFirst.map(({ product, qty, sum }, index) => {
                  const brand = brandBySlug.get(product.brand)?.name ?? product.brand;
                  const name = `${brand} ${product.model}`;
                  const kit = kitLine(product, locale);
                  const atMax = qty >= Math.min(product.stock, 99);
                  return (
                    <li key={product.slug} className="flex gap-3.5 border-b border-[var(--hair)] py-4 md:gap-4 md:py-[18px]">
                      <Link
                        href={productHref(locale, product.slug)}
                        onClick={close}
                        tabIndex={-1}
                        aria-hidden
                        className="relative block h-[72px] w-[72px] shrink-0 md:h-20 md:w-20"
                      >
                        <Image src={imageOf(product)} alt="" fill sizes="80px" className="object-contain" />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div id={`${titleId}-${product.slug}`} className="min-w-0">
                            <span className="block text-sm text-bone-dim">{brand}</span>
                            <Link
                              href={productHref(locale, product.slug)}
                              onClick={close}
                              data-line-name
                              className="block text-base font-medium leading-snug text-bone transition-colors hover:text-signal-text md:text-[17px]"
                            >
                              {product.model}
                            </Link>
                          </div>
                          <span className="t-price shrink-0 pt-5 text-[17px] text-bone">{price(sum)} ₴</span>
                        </div>
                        {/* Outside the price row, so the kit line gets the full width and stays on one line. */}
                        <span id={`${titleId}-${product.slug}-kit`} className={`mt-0.5 block text-sm leading-snug ${kit.tone}`}>
                          {kit.text}
                        </span>
                        <div className="mt-2 flex items-center justify-between gap-3">
                          <div className="flex items-center rounded-full border border-[var(--hair-strong)]">
                            <button
                              type="button"
                              onClick={() => qty > 1 && setQty(product.slug, qty - 1)}
                              aria-disabled={qty <= 1}
                              aria-label={dict.drawer.dec(name)}
                              className="icon-btn !text-bone aria-disabled:cursor-default aria-disabled:!text-bone-faint"
                            >
                              <IconMinus className="h-4 w-4" />
                            </button>
                            <span className="t-price w-7 text-center text-base text-bone">{qty}</span>
                            <button
                              type="button"
                              onClick={() => !atMax && setQty(product.slug, qty + 1)}
                              aria-disabled={atMax}
                              aria-label={dict.drawer.inc(name)}
                              className="icon-btn !text-bone aria-disabled:cursor-default aria-disabled:!text-bone-faint"
                            >
                              <IconPlus className="h-4 w-4" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeLine(product.slug, index)}
                            aria-label={dict.drawer.removeItem(name)}
                            data-line-remove
                            className="h-11 rounded-full px-1 text-sm text-bone-dim underline underline-offset-[3px] transition-colors hover:text-bone"
                          >
                            {dict.drawer.remove}
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="flex flex-col gap-2.5 py-5">
                <p className="text-[15px] leading-snug text-bone">
                  {left > 0 ? dict.drawer.freeLeft(price(left)) : dict.drawer.freeDone}
                </p>
                <div aria-hidden className="h-1.5 overflow-hidden rounded-full bg-ink-700">
                  <div className="cart-drawer-progress h-full rounded-full" style={{ width: `${progress}%` }} />
                </div>
              </div>

              {suggestion ? (
                <Suggestion
                  product={suggestion}
                  locale={locale}
                  label={suggestion.category === "safety" ? dict.drawer.suggestSafety : dict.drawer.suggestAccessory}
                  addLabel={dict.drawer.suggestAdd(fullName(suggestion))}
                  onAdd={() => addSuggestion(suggestion.slug)}
                  onNavigate={close}
                />
              ) : null}
            </div>

            <div className="cart-drawer-foot">
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-base text-bone">{dict.drawer.total(pieces)}</span>
                <span className="t-price text-2xl text-bone md:text-[26px]">{price(subtotal)} ₴</span>
              </div>
              {/* Phones drop the note, as in the phone canvas: the sheet needs the room for lines. */}
              <p className="-mt-1 hidden text-sm text-bone-dim md:block">{dict.drawer.deliveryNote}</p>
              <Link href={href(locale, "/checkout")} onClick={close} className="signal-btn mt-1 w-full">
                {dict.drawer.checkout}
              </Link>
              <button type="button" onClick={close} className="ghost-btn w-full">
                {dict.drawer.continue}
              </button>
              <Link
                href={href(locale, "/cart")}
                onClick={close}
                className="-mb-2 inline-flex h-11 items-center self-center rounded-full px-2 text-[15px] text-bone-dim underline underline-offset-[3px] transition-colors hover:text-bone"
              >
                {dict.drawer.openCart}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Suggestion({
  product,
  locale,
  label,
  addLabel,
  onAdd,
  onNavigate,
}: {
  product: Product;
  locale: Locale;
  label: string;
  addLabel: string;
  onAdd: () => void;
  onNavigate: () => void;
}) {
  const name = fullName(product);
  return (
    <div className="flex flex-col gap-3 border-t border-[var(--hair)] pb-5 pt-4">
      <p className="text-sm text-bone-dim">{label}</p>
      <div className="flex items-center gap-3.5">
        <Link
          href={productHref(locale, product.slug)}
          onClick={onNavigate}
          tabIndex={-1}
          aria-hidden
          className="relative block h-14 w-14 shrink-0"
        >
          <Image src={imageOf(product)} alt="" fill sizes="56px" className="object-contain" />
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            href={productHref(locale, product.slug)}
            onClick={onNavigate}
            className="block truncate text-base font-medium text-bone transition-colors hover:text-signal-text"
          >
            {name}
          </Link>
          <span className="block truncate text-sm text-bone-dim">
            {keyValue(product, locale)} · {price(product.price)} ₴
          </span>
        </div>
        <button
          type="button"
          onClick={onAdd}
          aria-label={addLabel}
          className="icon-btn shrink-0 border border-[var(--hair-strong)] !text-bone transition-colors hover:border-signal hover:!text-signal-text"
        >
          <IconPlus className="h-[18px] w-[18px]" />
        </button>
      </div>
    </div>
  );
}
