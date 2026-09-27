"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/i18n/context";
import { href, orderTotals, price } from "@/lib/shop";
import { useMounted } from "@/lib/use-mounted";
import { useCart } from "@/store/shop";
import { useCartUI } from "@/store/cart-ui";
import { IconCart } from "@/components/ui/icons";

/**
 * Header cart pill (015). A link to /cart, so it works without JS; with JS a plain click opens the
 * cart drawer instead (right panel from 768px, bottom sheet on phones). With an empty cart, on the
 * cart page itself and on a modified click (new tab, new window) it stays an ordinary link.
 *
 * Shows the sum from 640px and a count badge at every size. After an add the pill fills with the
 * brand gradient for 1.2s (`addedAt` in store/cart-ui.ts, CSS in the 015 cart drawer block).
 *
 * The header mounts the pill twice (desktop row and phone row). Everything shared, the drawer and
 * the screen reader live region, is mounted once by `CartDrawer` in the layout. `withModal` is left
 * from the modal era: header.tsx passes `false` on the phone row, and it now only tags the
 * instance for scripts (`data-row`).
 */
export function CartButton({ withModal = true }: { withModal?: boolean }) {
  const { locale, dict } = useI18n();
  const mounted = useMounted();
  const pathname = usePathname();
  const cartItems = useCart((state) => state.items);
  const flashing = useCartUI((state) => state.addedAt > 0);

  const { pieces: cartCount, subtotal: cartSum } = mounted ? orderTotals(cartItems) : { pieces: 0, subtotal: 0 };
  const opensDrawer = cartCount > 0 && !pathname.endsWith("/cart");

  return (
    <Link
      href={href(locale, "/cart")}
      onClick={(event) => {
        if (!opensDrawer || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
          return;
        }
        event.preventDefault();
        useCartUI.getState().show("cart");
      }}
      aria-label={`${dict.nav.cart}${cartCount ? `, ${cartCount}` : ""}`}
      aria-haspopup={opensDrawer ? "dialog" : undefined}
      data-flash={mounted && flashing ? "" : undefined}
      data-row={withModal ? "desktop" : "phone"}
      className="cart-pill relative ml-1 inline-flex h-11 min-w-11 shrink-0 items-center justify-center gap-2 rounded-full text-[15px] font-medium text-bone transition-colors sm:border sm:border-[var(--hair-strong)] sm:pl-3.5 sm:pr-4 sm:hover:border-signal lg:ml-2"
    >
      <IconCart className="h-5 w-5 shrink-0" />
      <span className="hidden sm:inline">
        {cartSum > 0 ? <span className="t-price text-[15px]">{price(cartSum)} ₴</span> : dict.nav.cart}
      </span>
      {cartCount > 0 ? (
        <span
          aria-hidden
          className="absolute right-0 top-0 grid h-[22px] min-w-[22px] place-items-center rounded-full bg-bone px-1.5 text-sm font-semibold leading-none tabular-nums text-ink-900 sm:static"
        >
          {cartCount}
        </span>
      ) : null}
    </Link>
  );
}
