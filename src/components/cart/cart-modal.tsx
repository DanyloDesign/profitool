"use client";

import { createPortal } from "react-dom";
import { useEffect, useRef, type RefObject } from "react";
import { useI18n } from "@/i18n/context";
import { useCartUI } from "@/store/cart-ui";
import { useMounted } from "@/lib/use-mounted";
import { IconClose } from "@/components/ui/icons";
import { CartView } from "@/components/cart/cart-view";

/**
 * Кошик поверх сторінки на планшеті й десктопі (≥768px). Монтується порталом у document.body:
 * шапка стоїть на своєму backdrop-filter-шарі, і "position: fixed" всередині неї прилипає не
 * до вʼюпорта, а до цього шару (див. CLAUDE.md). Доступність: role=dialog, фокус-трап,
 * Escape, повернення фокуса на кнопку-триґер, блокування скролу сторінки.
 */
export function CartModal({ triggerRef }: { triggerRef: RefObject<HTMLElement | null> }) {
  const mounted = useMounted();
  const { dict } = useI18n();
  const panel = useCartUI((state) => state.panel);
  const close = useCartUI((state) => state.close);
  const open = panel === "modal";
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    const node = dialogRef.current;
    const trigger = triggerRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Фокус іде на кнопку закриття, не на контейнер: інакше перший Shift+Tab
    // з tabIndex=-1 контейнера вилітає з діалогу повз усі елементи в ньому.
    closeRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
        return;
      }
      if (event.key !== "Tab" || !node) return;
      const focusable = node.querySelectorAll<HTMLElement>(
        'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || active === node)) {
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
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [open, close, triggerRef]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex justify-center overflow-y-auto bg-[var(--scrim)] px-4 py-[6vh] sm:px-8"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={dict.cart.title}
        tabIndex={-1}
        className="h-fit max-h-[88vh] w-full max-w-[1040px] overflow-y-auto rounded-[28px] border border-[var(--hair-strong)] bg-ink-850 p-6 shadow-[var(--shadow-pop)] outline-none sm:p-10"
      >
        <div className="flex items-center justify-between">
          <h2 className="t-h2 text-bone">{dict.cart.title}</h2>
          <button ref={closeRef} type="button" onClick={close} aria-label={dict.cart.closeCart} className="icon-btn">
            <IconClose className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-7">
          <CartView />
        </div>
      </div>
    </div>,
    document.body,
  );
}
