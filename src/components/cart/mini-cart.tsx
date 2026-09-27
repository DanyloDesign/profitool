"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type RefObject } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/i18n/context";
import { brandBySlug } from "@/data/taxonomy";
import { productBySlug } from "@/data/products";
import { cartTotals, href, imageOf, price, productHref } from "@/lib/shop";
import { useCart, type CartItem } from "@/store/shop";
import { useCartUI } from "@/store/cart-ui";
import { IconClose, IconTrash } from "@/components/ui/icons";

const AUTO_CLOSE_MS = 4000;

/**
 * Модульний прапорець «звідки прийшло останнє відкриття mini-cart» — hover/фокус на кнопці
 * кошика (CartButton) чи announceAdded (додавання товару десь на сторінці). Стор cart-ui.ts
 * цього не знає (тільки panel: "mini" | "modal" | null), а announceAdded — чужий незмінний
 * API, тому джерело фіксуємо тут, синхронно, до виклику show("mini"). CartButton викликає
 * markMiniCartHoverOpen() прямо перед show("mini") зі свого pointerenter/focus-обробника.
 */
type MiniCartSource = "hover" | "announce";
let lastMiniCartSource: MiniCartSource = "announce";

export function markMiniCartHoverOpen() {
  lastMiniCartSource = "hover";
}

/**
 * Выпадашка под кнопкой корзины. Открывается двумя способами:
 *  - announceAdded() после «В кошик» (карточка товара, buy-box) — подтверждение, само
 *    закрывается через 4с, если не держат мышью/фокусом;
 *  - наведение на кнопку корзины (CartButton, ≥768px + hover:hover +
 *    pointer:fine) — 4с-таймер не запускаем, открытием и закрытием управляет сам CartButton.
 * Разница между источниками — lastMiniCartSource выше. Клик вне, Escape и переход на другую
 * страницу закрывают дропдаун в любом режиме; Escape возвращает фокус на кнопку, если он был в дропдауне.
 *
 * Рядок товару — це <Link> (картинка + назва + кількість) і окрема кнопка видалення поруч,
 * без вкладення button в link. Видалення переносить фокус на кнопку видалення рядка, що
 * став на місце видаленого (або попереднього), або на кнопку кошика, якщо кошик спорожнів.
 *
 * Живой регион для скринридеров рендерится всегда (не только когда дропдаун открыт):
 * текст обновляется дифом items при каждом добавлении и удалении товара.
 */
export function MiniCart({ triggerRef }: { triggerRef: RefObject<HTMLElement | null> }) {
  const { locale, dict } = useI18n();
  const router = useRouter();
  const panel = useCartUI((state) => state.panel);
  const close = useCartUI((state) => state.close);
  const items = useCart((state) => state.items);
  const remove = useCart((state) => state.remove);
  const open = panel === "mini";

  const rootRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevItemsRef = useRef<CartItem[]>(items);
  const hoverOpenRef = useRef(false);
  const removalIndexRef = useRef<number | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const { lines, total, pieces } = cartTotals(items);

  // Новий slug або зросла кількість — «додано в кошик»; зниклий slug або зменшена кількість —
  // «прибрано з кошика». За раз вважаємо лише одну подію (реальний user-флоу так і працює).
  useEffect(() => {
    const prev = prevItemsRef.current;
    prevItemsRef.current = items;

    const added = items.find((item) => {
      const before = prev.find((p) => p.slug === item.slug);
      return !before || item.qty > before.qty;
    });
    if (added) {
      const product = productBySlug.get(added.slug);
      if (product) {
        const brand = brandBySlug.get(product.brand)?.name ?? product.brand;
        setAnnouncement(dict.cart.added(`${brand} ${product.model}`));
      }
      return;
    }

    const removed = prev.find((item) => {
      const after = items.find((p) => p.slug === item.slug);
      return !after || item.qty > after.qty;
    });
    if (removed) {
      const product = productBySlug.get(removed.slug);
      if (product) {
        const brand = brandBySlug.get(product.brand)?.name ?? product.brand;
        setAnnouncement(dict.cart.removed(`${brand} ${product.model}`));
      }
    }
  }, [items, dict]);

  // Фіксуємо джерело поточного відкриття один раз при переході open -> true; при закритті
  // скидаємо на "announce" за замовчуванням, щоб наступний announceAdded не успадкував hover.
  useEffect(() => {
    if (!open) return undefined;
    hoverOpenRef.current = lastMiniCartSource === "hover";
    return () => {
      lastMiniCartSource = "announce";
    };
  }, [open]);

  // Автозакрытие только для открытия через announceAdded. Колбэк закрывает лишь мини-корзину:
  // если за эти 4с открыли модалку, таймер не должен её захлопнуть.
  const restartTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (pausedRef.current || hoverOpenRef.current) return;
    timerRef.current = setTimeout(() => {
      if (useCartUI.getState().panel === "mini") close();
    }, AUTO_CLOSE_MS);
  };

  useEffect(() => {
    if (!open) return undefined;
    if (hoverOpenRef.current) return undefined; // hover/фокусом керує сам CartButton
    pausedRef.current = false;
    restartTimer();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // restartTimer читает свежие ref'ы, пересобирать эффект от него не нужно
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, close]);

  // Клик вне и Escape закрывают дропдаун; Escape дополнительно возвращает фокус на кнопку.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        // Фокус возвращаем на кнопку, только если он был внутри дропдауна: Escape после
        // «В кошик» на карточке не должен утаскивать фокус в шапку.
        const inside = rootRef.current?.contains(document.activeElement) ?? false;
        close();
        if (inside) triggerRef.current?.focus();
      }
    };
    const onClick = (event: MouseEvent) => {
      // Шапка монтирует CartButton дважды (десктоп и телефон). Экземпляр в скрытой половине
      // не рендерит боксов и не должен считать клик в видимом дропдауне «кликом снаружи».
      const root = rootRef.current;
      if (!root || root.getClientRects().length === 0) return;
      if (!root.contains(event.target as Node)) close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open, close, triggerRef]);

  const pause = () => {
    pausedRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
  };
  const resume = () => {
    pausedRef.current = false;
    restartTimer();
  };

  const openCart = () => {
    if (window.matchMedia("(min-width: 768px)").matches) {
      useCartUI.getState().show("modal");
    } else {
      close();
      router.push(href(locale, "/cart"));
    }
  };

  const handleRemove = (slug: string, index: number) => {
    removalIndexRef.current = index;
    remove(slug);
  };

  const showDropdown = open && lines.length > 0;

  // Після видалення переносимо фокус: на кнопку видалення рядка, що став на місце видаленого
  // (або на попередній, якщо видалили останній рядок), або на кнопку кошика, якщо рядків
  // не лишилось — тоді showDropdown стає false і сам дропдаун зникає з DOM.
  useEffect(() => {
    if (removalIndexRef.current === null) return;
    const index = removalIndexRef.current;
    removalIndexRef.current = null;
    if (!showDropdown) {
      triggerRef.current?.focus();
      return;
    }
    const buttons = rootRef.current?.querySelectorAll<HTMLButtonElement>("[data-remove-item]");
    const target = buttons?.[index] ?? buttons?.[buttons.length - 1];
    target?.focus();
    // showDropdown и triggerRef стабильны/производны, реагируем только на смену items
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  return (
    <>
      {/* Візуально прибрано, але завжди в DOM: скринридер бачить оновлення тексту незалежно
          від того, чи встиг відкритись/закритись сам дропдаун. */}
      <span role="status" aria-live="polite" className="sr-only">
        {announcement}
      </span>

      {showDropdown ? (
        <div
          ref={rootRef}
          onMouseEnter={pause}
          onMouseLeave={resume}
          onFocus={pause}
          onBlur={resume}
          role="dialog"
          aria-labelledby="mini-cart-title"
          className="absolute right-0 top-[calc(100%+10px)] z-[65] w-[360px] max-w-[92vw] overflow-hidden rounded-[24px] border border-[var(--hair-strong)] bg-ink-850 shadow-[var(--shadow-pop)]"
        >
          <div className="flex items-center justify-between border-b border-[var(--hair)] px-5 py-3">
            <span id="mini-cart-title" className="text-[15px] font-medium text-bone">
              {dict.cart.miniTitle(pieces)}
            </span>
            <button type="button" onClick={close} aria-label={dict.cart.closeCart} className="icon-btn">
              <IconClose className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[300px] overflow-y-auto px-5">
            {lines.map(({ product, qty, sum }, index) => {
              const brand = brandBySlug.get(product.brand)?.name ?? product.brand;
              const name = `${brand} ${product.model}`;
              return (
                <div
                  key={product.slug}
                  className="flex items-center gap-3 border-b border-[var(--hair)] py-3.5 last:border-none"
                >
                  <Link
                    href={productHref(locale, product.slug)}
                    onClick={close}
                    className="flex min-w-0 flex-1 items-center gap-3"
                  >
                    <span className="relative block h-12 w-12 shrink-0">
                      <Image src={imageOf(product)} alt={name} fill sizes="48px" className="object-contain" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-bone">{name}</span>
                      <span className="t-num block text-sm text-bone-dim">
                        {qty} × {price(product.price)} ₴
                      </span>
                    </span>
                  </Link>
                  <span className="t-price shrink-0 text-base text-bone">{price(sum)} ₴</span>
                  <button
                    type="button"
                    data-remove-item="true"
                    onClick={() => handleRemove(product.slug, index)}
                    aria-label={dict.cart.removeItem(name)}
                    className="icon-btn shrink-0"
                  >
                    <IconTrash className="h-[18px] w-[18px]" />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="border-t border-[var(--hair)] px-5 py-4">
            <div className="mb-3.5 flex items-baseline justify-between">
              <span className="text-sm text-bone-dim">{dict.cart.total}</span>
              <span className="t-price text-xl text-bone">{price(total)} ₴</span>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={openCart} className="ghost-btn flex-1 !px-0">
                {dict.cart.miniCartBtn}
              </button>
              <Link href={href(locale, "/checkout")} onClick={close} className="signal-btn flex-1 !px-0">
                {dict.cart.miniCheckoutBtn}
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
