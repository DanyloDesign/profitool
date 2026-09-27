"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useI18n } from "@/i18n/context";
import { cartTotals, href, price } from "@/lib/shop";
import { useMounted } from "@/lib/use-mounted";
import { useCart } from "@/store/shop";
import { useCartUI } from "@/store/cart-ui";
import { IconCart } from "@/components/ui/icons";
import { MiniCart, markMiniCartHoverOpen } from "@/components/cart/mini-cart";
import { CartModal } from "@/components/cart/cart-modal";

const HOVER_CLOSE_DELAY_MS = 250;

/**
 * Кнопка корзины в шапке: иконка, сумма, счётчик на телефоне. Точка подключения мини-корзины
 * и модального окна (store/cart-ui.ts). Шапка только монтирует этот компонент.
 *
 * На ≥md клик не ведёт на страницу /cart, а открывает модалку поверх текущей страницы —
 * href остаётся на месте для случая без JS. На телефоне ведёт себя как обычная ссылка.
 *
 * На устройствах с настоящим hover (мышь, ≥768px + hover:hover + pointer:fine) наведение на
 * обёртку (кнопка и зона под ней, где рендерится дропдаун) открывает мини-корзину без клика;
 * уход курсора закрывает её через ~250мс — задержка нужна, чтобы переход через 10px-зазор до
 * дропдауна (top-[calc(100%+10px)]) не считался «вышли», а повторный вход в обёртку эту
 * задержку отменяет. С клавиатуры мини-корзина по фокусу не открывается: иначе каждый Tab по
 * шапке проводит через все её строки, а Escape и закрытие модалки, возвращая фокус на кнопку,
 * открывали бы её снова. Enter открывает модалку, там всё то же. Уход фокуса из обёртки
 * закрывает мини-корзину, открытую наведением. Открытие через hover
 * помечается в mini-cart.tsx через markMiniCartHoverOpen() перед show("mini"), чтобы там
 * отличить его от announceAdded и не запускать 4с автозакрытие — им управляет этот компонент.
 * Клик всегда открывает модалку (и мини-корзина закрывается, т.к. panel переключается на
 * "modal"); на телефоне hover-открытие не работает — там кнопка обычная ссылка на /cart.
 * Шапка монтирует кнопку дважды (телефон и ≥768); модалка нужна только второй, иначе
 * при клике открываются две одинаковые модалки друг над другом — отсюда withModal.
 */
export function CartButton({ withModal = true }: { withModal?: boolean }) {
  const { locale, dict } = useI18n();
  const mounted = useMounted();
  const cartItems = useCart((state) => state.items);
  const trigger = useRef<HTMLAnchorElement>(null);
  const pathname = usePathname();
  const previousPathname = useRef(pathname);

  const hoverActiveRef = useRef(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cartCount = mounted ? cartItems.reduce((acc, item) => acc + item.qty, 0) : 0;
  const cartSum = mounted ? cartTotals(cartItems).subtotal : 0;

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  // Переход на другую страницу закрывает и мини-корзину, и модалку.
  useEffect(() => {
    if (previousPathname.current === pathname) return;
    previousPathname.current = pathname;
    hoverActiveRef.current = false;
    clearCloseTimeout();
    useCartUI.getState().close();
  }, [pathname]);

  // На размонтировании не оставляем висящий таймер закрытия.
  useEffect(() => clearCloseTimeout, []);

  const canOpenViaHover = () =>
    mounted &&
    cartItems.length > 0 &&
    useCartUI.getState().panel !== "modal" &&
    window.matchMedia("(min-width: 768px) and (hover: hover) and (pointer: fine)").matches;

  const openViaHover = () => {
    if (!canOpenViaHover()) return;
    clearCloseTimeout();
    hoverActiveRef.current = true;
    markMiniCartHoverOpen();
    useCartUI.getState().show("mini");
  };

  const scheduleHoverClose = () => {
    if (!hoverActiveRef.current) return;
    clearCloseTimeout();
    closeTimeoutRef.current = setTimeout(() => {
      closeTimeoutRef.current = null;
      hoverActiveRef.current = false;
      if (useCartUI.getState().panel === "mini") useCartUI.getState().close();
    }, HOVER_CLOSE_DELAY_MS);
  };

  return (
    <div
      className="relative"
      onPointerEnter={(event) => {
        if (event.pointerType !== "mouse") return;
        openViaHover();
      }}
      onPointerLeave={(event) => {
        if (event.pointerType !== "mouse") return;
        scheduleHoverClose();
      }}
      onBlur={(event) => {
        // Фокус лишається всередині обгортки (кнопка <-> дропдаун) — не закриваємо.
        if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
        if (!hoverActiveRef.current) return;
        hoverActiveRef.current = false;
        clearCloseTimeout();
        useCartUI.getState().close();
      }}
    >
      <Link
        ref={trigger}
        href={href(locale, "/cart")}
        onClick={(event) => {
          if (window.matchMedia("(min-width: 768px)").matches) {
            event.preventDefault();
            hoverActiveRef.current = false;
            clearCloseTimeout();
            useCartUI.getState().show("modal");
          }
        }}
        aria-label={`${dict.nav.cart}${cartCount ? `, ${cartCount}` : ""}`}
        className="relative ml-1 inline-flex h-11 items-center gap-2.5 rounded-full border border-[var(--hair-strong)] px-3 text-[15px] font-medium text-bone transition-colors hover:border-signal sm:h-[52px] sm:px-5 lg:ml-2"
      >
        <IconCart className="h-5 w-5" />
        <span className="hidden sm:inline">
          {cartSum > 0 ? <span className="t-num">{price(cartSum)} ₴</span> : dict.nav.cart}
        </span>
        {cartCount > 0 ? (
          <span className="t-num absolute -right-1 -top-1 grid h-[20px] min-w-[20px] place-items-center rounded-full bg-signal px-1.5 text-[11px] font-semibold text-black sm:hidden">
            {cartCount}
          </span>
        ) : null}
      </Link>

      <MiniCart triggerRef={trigger} />
      {withModal ? <CartModal triggerRef={trigger} /> : null}
    </div>
  );
}
