"use client";

import { deliveryOptions as t } from "@/data/info";
import { useI18n } from "@/i18n/context";
import { useMounted } from "@/lib/use-mounted";
import { FREE_DELIVERY_FROM, orderTotals, price } from "@/lib/shop";
import { useCart } from "@/store/shop";

const money = (value: number) => `${price(value)} ₴`;

/**
 * Delivery page (025): the free-delivery rule on top, then Nova Poshta, Ukrposhta and pickup as three
 * equal columns. Below the threshold the buyer pays the carrier's rate, so no price is invented here.
 * The cart line appears only after mount (stores read localStorage), so hydration matches.
 */
export function DeliveryOptions() {
  const { locale, dict } = useI18n();
  const mounted = useMounted();
  const items = useCart((s) => s.items);
  const subtotal = mounted ? orderTotals(items).subtotal : 0;
  const left = FREE_DELIVERY_FROM - subtotal;
  const percent = Math.min(100, Math.round((subtotal / FREE_DELIVERY_FROM) * 100));

  return (
    <div>
      <section aria-label={t.freeRule[locale]} className="mt-5 border-y border-[var(--hair)] py-6">
        <p className="t-h3 text-bone">{t.freeRule[locale]}</p>
        <p className="mt-1 max-w-2xl text-base text-bone-dim">{t.freeRuleNote[locale]}</p>
        {subtotal > 0 ? (
          <div aria-live="polite" className="mt-5 max-w-xl">
            <p className="text-base font-semibold text-bone">
              {left > 0
                ? t.cartLeft[locale].replace("{sum}", money(subtotal)).replace("{left}", money(left))
                : t.cartFree[locale]}
            </p>
            <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-ink-600">
              <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundImage: "var(--grad-brand)" }} />
            </div>
          </div>
        ) : null}
      </section>

      <div className="grid lg:grid-cols-3">
        {t.methods.map((method) => (
          <section
            key={method.key}
            className="min-w-0 border-b border-[var(--hair)] py-6 lg:border-b-0 lg:border-r lg:pr-10 lg:[&+&]:pl-10"
          >
            <h2 className="t-h3 text-bone">{method.name[locale]}</h2>
            <p className="t-section mt-3 text-bone">{method.term[locale]}</p>
            <p className="mt-4 text-base leading-snug text-bone">{method.where[locale]}</p>
            <p className="mt-1 text-base leading-snug text-bone-dim">{method.price[locale]}</p>
            <a
              href={method.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-base font-semibold text-signal-text underline-offset-4 hover:underline"
            >
              {method.link[locale]}
            </a>
          </section>
        ))}

        <section className="min-w-0 py-6 lg:pl-10">
          <h2 className="t-h3 text-bone">{t.pickup[locale]}</h2>
          <div className="mt-3 flex items-start gap-5">
            <svg
              role="img"
              aria-label={t.mapLabel[locale]}
              viewBox="0 0 160 120"
              className="h-[104px] w-[138px] shrink-0 rounded-[18px] bg-ink-800"
            >
              <path d="M-5 80 C 50 60, 90 110, 170 70" stroke="var(--color-ink-900)" strokeWidth="10" fill="none" />
              <path d="M55 -5 L 75 125" stroke="var(--color-ink-900)" strokeWidth="7" fill="none" />
              <path d="M80 70 C 72 60, 68 54, 68 48 a 12 12 0 0 1 24 0 c 0 6 -4 12 -12 22z" fill="var(--color-bone)" />
              <circle cx="80" cy="48" r="4" fill="var(--color-ink-900)" />
            </svg>
            <div className="min-w-0 text-base leading-snug">
              <p className="text-bone">{dict.common.footerAddress}</p>
              <p className="mt-1 whitespace-nowrap text-bone-dim">{dict.common.footerHours}</p>
              <p className="mt-1 text-bone-dim">{t.pickupPrice[locale]}</p>
            </div>
          </div>
          <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-base font-semibold">
            <a
              href={t.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-signal-text underline-offset-4 hover:underline"
            >
              {t.mapLink[locale]}
            </a>
            <a href={`tel:${dict.common.phone.replace(/\s/g, "")}`} className="text-bone underline-offset-4 hover:underline">
              {dict.common.phone}
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
