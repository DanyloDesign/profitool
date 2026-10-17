"use client";

import { useState, type CSSProperties } from "react";
import { deliveryCalc as t } from "@/data/info";
import { useI18n } from "@/i18n/context";
import { useMounted } from "@/lib/use-mounted";
import { DELIVERY_COST, FREE_DELIVERY_FROM, orderTotals, price } from "@/lib/shop";
import { useCart } from "@/store/shop";

const MAX = 10000;
const DEFAULT_SUM = 3000;
const money = (value: number) => `${price(value)} ₴`;

/**
 * Delivery page, direction B: pick a method and an order sum, see the cost. Starts from the cart
 * subtotal once mounted (server and first client render both use 0, so hydration matches).
 * Fits one desktop screen at 1440x800 together with the breadcrumbs and the title.
 */
export function DeliveryCalculator() {
  const { locale, dict } = useI18n();
  const mounted = useMounted();
  const items = useCart((s) => s.items);
  const [override, setOverride] = useState<number | null>(null);
  const [pickup, setPickup] = useState(false);

  // An empty cart would open the page on "0 ₴" with an empty bar; start from a typical order instead.
  const subtotal = mounted ? orderTotals(items).subtotal : 0;
  const cartSum = subtotal > 0 ? Math.min(MAX, subtotal) : DEFAULT_SUM;
  const sum = override ?? cartSum;

  const free = pickup || sum >= FREE_DELIVERY_FROM;
  const percent = pickup ? 100 : Math.min(100, Math.round((sum / FREE_DELIVERY_FROM) * 100));
  const note = pickup
    ? t.notePickup[locale]
    : free
      ? t.noteFree[locale]
      : t.noteLeft[locale].replace("{sum}", money(FREE_DELIVERY_FROM - sum));
  const term = pickup ? dict.common.footerHours : t.termNovapost[locale];

  const toggle = (on: boolean) =>
    `inline-flex h-11 items-center rounded-full border px-5 text-base font-semibold transition-colors ${
      on ? "border-bone bg-bone text-ink-900" : "border-[var(--hair-strong)] bg-transparent text-bone hover:border-bone"
    }`;

  return (
    <div>
      <section
        aria-label={t.sectionLabel[locale]}
        className="mt-5 grid gap-x-16 gap-y-6 border-y border-[var(--hair)] py-6 lg:grid-cols-2"
      >
        <div className="flex min-w-0 flex-col gap-6">
          <div role="group" aria-label={t.methodLabel[locale]} className="flex flex-wrap gap-2">
            <button type="button" aria-pressed={!pickup} onClick={() => setPickup(false)} className={toggle(!pickup)}>
              {t.novapost[locale]}
            </button>
            <button type="button" aria-pressed={pickup} onClick={() => setPickup(true)} className={toggle(pickup)}>
              {t.pickup[locale]}
            </button>
          </div>
          <div>
            <label htmlFor="delivery-sum" className="flex justify-between gap-4 text-base text-bone-dim">
              <span>{t.sumLabel[locale]}</span>
              <span className="font-semibold text-bone">{money(sum)}</span>
            </label>
            <input
              id="delivery-sum"
              type="range"
              min={0}
              max={MAX}
              step={100}
              value={sum}
              onChange={(event) => setOverride(Number(event.target.value))}
              className="delivery-range mt-2"
              style={{ "--fill": `${(sum / MAX) * 100}%` } as CSSProperties}
            />
            {/* The free-delivery threshold sits exactly mid-scale (5 000 of 10 000), so the slider
                and the progress bar on the right read the same point. */}
            <div className="grid grid-cols-3 text-sm text-bone-faint">
              <span>{money(0)}</span>
              <span className="text-center font-semibold text-bone-dim">{money(FREE_DELIVERY_FROM)}</span>
              <span className="text-right">{money(MAX)}</span>
            </div>
          </div>
        </div>

        <div aria-live="polite" className="min-w-0">
          <p className="text-base text-bone-dim">{pickup ? t.resultPickup[locale] : t.resultNovapost[locale]}</p>
          <p className="t-price mt-1 font-black text-[clamp(4rem,9vw,6.25rem)] leading-[0.95] tracking-[-0.03em] text-bone">
            {money(free ? 0 : DELIVERY_COST)}
          </p>
          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-ink-600">
            <div
              className="h-full rounded-full transition-[width] duration-200 motion-reduce:transition-none"
              style={{ width: `${percent}%`, backgroundImage: "var(--grad-brand)" }}
            />
          </div>
          <p className="mt-3 text-lg font-semibold text-bone">{note}</p>
          <p className="mt-1 text-base text-bone-dim">{term}</p>
        </div>
      </section>

      <div data-delivery-end className="grid lg:grid-cols-2">
        <section className="min-w-0 py-5 lg:border-r lg:border-[var(--hair)] lg:pr-12">
          <h2 className="t-h3 text-bone">{t.novapost[locale]}</h2>
          <ul className="mt-3 grid list-disc gap-2 pl-5 text-base leading-snug text-bone marker:text-bone-dim">
            {t.novapostFacts.map((fact) => (
              <li key={fact.ua}>{fact[locale]}</li>
            ))}
          </ul>
        </section>
        <section className="min-w-0 py-5 lg:pl-12">
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
              <p className="mt-1 text-bone-dim">{dict.common.footerHours}</p>
              <p className="mt-2 flex flex-wrap gap-x-5 gap-y-1 font-semibold">
                <a
                  href={t.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-signal-text underline-offset-4 hover:underline"
                >
                  {t.mapLink[locale]}
                </a>
                <a
                  href={`tel:${dict.common.phone.replace(/\s/g, "")}`}
                  className="text-bone underline-offset-4 hover:underline"
                >
                  {dict.common.phone}
                </a>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
