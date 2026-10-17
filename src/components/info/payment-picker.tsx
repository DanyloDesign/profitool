"use client";

import { useState } from "react";
import { paymentPicker as t, type PaymentMethodKey } from "@/data/info";
import { useI18n } from "@/i18n/context";

/**
 * Payment page, direction B: pick a method, read how it works. Three methods on the left,
 * headline and three steps on the right. Sized to fit one desktop screen with the title,
 * like the delivery page.
 */
export function PaymentPicker() {
  const { locale } = useI18n();
  const [picked, setPicked] = useState<PaymentMethodKey>("card");
  const current = t.methods.find((m) => m.key === picked) ?? t.methods[0];

  const button = (on: boolean) =>
    `block w-full rounded-[22px] border px-5 py-3.5 text-left transition-colors ${
      on ? "border-bone bg-bone text-ink-900" : "border-[var(--hair-strong)] bg-transparent text-bone hover:border-bone"
    }`;

  return (
    <div>
      <section className="mt-5 grid gap-x-16 gap-y-6 border-y border-[var(--hair)] py-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <div role="group" aria-label={t.groupLabel[locale]} className="flex min-w-0 flex-col gap-2.5">
          {t.methods.map((m) => {
            const on = m.key === picked;
            return (
              <button key={m.key} type="button" aria-pressed={on} onClick={() => setPicked(m.key)} className={button(on)}>
                <span className="font-display block text-lg font-semibold leading-tight">{m.title[locale]}</span>
                <span className={`mt-1 block text-base leading-snug ${on ? "text-ink-900" : "text-bone-dim"}`}>
                  {m.sub[locale]}
                </span>
              </button>
            );
          })}
        </div>

        <div aria-live="polite" className="min-w-0">
          <p className="text-base text-bone-dim">{current.kicker[locale]}</p>
          <p className="font-display mt-1 text-[clamp(1.75rem,3.2vw,2.75rem)] font-black leading-[1.02] tracking-[-0.02em] text-bone">
            {current.headline[locale]}
          </p>
          <ol className="mt-5 grid list-none gap-3 p-0">
            {current.steps.map((step, i) => (
              <li key={step.ua} className="flex items-baseline gap-3.5 text-base leading-snug text-bone">
                <span
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-base font-semibold text-black"
                  style={{ backgroundImage: "var(--grad-brand)" }}
                >
                  {i + 1}
                </span>
                <span>{step[locale]}</span>
              </li>
            ))}
          </ol>
          {picked === "card" ? (
            <ul aria-label={t.brandsLabel[locale]} className="mt-5 flex list-none flex-wrap gap-2 p-0">
              {t.brands.map((brand) => (
                <li key={brand} className="chip font-semibold hover:border-[var(--hair-strong)]">
                  {brand}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>
      <p data-payment-end className="mt-4 text-base text-bone-dim">
        {t.demo[locale]}
      </p>
    </div>
  );
}
