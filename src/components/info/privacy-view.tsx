"use client";

import { useState } from "react";
import { privacyView as t, type PrivacyUseKey } from "@/data/info";
import { useI18n } from "@/i18n/context";
import { plural, pluralEn } from "@/i18n/plural";
import { useAccount, useOrders } from "@/store/account";
import { useLocation } from "@/store/location";
import { useCart, useCompare, useLastOrder, usePlatform, useWishlist } from "@/store/shop";

const KEY_PREFIX = "profitool-";
const KEEP_KEY = "profitool-theme";

/** Empties every store in memory first (persist rewrites its key), then drops the leftover keys. */
function deleteBrowserData() {
  useCart.setState({ items: [] });
  useCompare.setState({ slugs: [] });
  useWishlist.setState({ slugs: [] });
  useLastOrder.setState({ items: [], number: null });
  usePlatform.setState({ slug: null });
  useAccount.setState({ session: null });
  useOrders.setState({ orders: [] });
  useLocation.setState({ citySlug: useLocation.getInitialState().citySlug, customCity: "" });
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key && key.startsWith(KEY_PREFIX) && key !== KEEP_KEY) keys.push(key);
    }
    keys.forEach((key) => localStorage.removeItem(key));
  } catch {
    // Storage blocked: the in-memory stores are already empty.
  }
}

type Stage = "idle" | "confirm" | "done";

/**
 * Privacy page, direction B: three toggles pick what the visitor uses, the right column lists
 * what is stored for it. The delete button really clears this browser's profitool-* data.
 */
export function PrivacyView() {
  const { locale } = useI18n();
  const [on, setOn] = useState<Record<PrivacyUseKey, boolean>>({ browse: true, order: true, account: false });
  const [stage, setStage] = useState<Stage>("idle");

  const items = t.uses.filter((u) => on[u.key]).flatMap((u) => u.items);
  const n = items.length;
  const forms = t.recordForms[locale === "ua" ? 0 : 1];
  const headline = n === 0 ? t.nothing[locale] : `${n} ${locale === "ua" ? plural(n, forms) : pluralEn(n, [forms[0], forms[1]])}`;

  const toggle = (active: boolean) =>
    `block w-full rounded-[22px] border px-5 py-3.5 text-left transition-colors ${
      active ?"border-bone bg-bone text-ink-900" : "border-[var(--hair-strong)] bg-transparent text-bone hover:border-bone"
    }`;

  return (
    <div>
      <section className="mt-5 grid gap-x-16 gap-y-6 border-y border-[var(--hair)] py-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <div role="group" aria-label={t.groupLabel[locale]} className="flex min-w-0 flex-col gap-2.5">
          {t.uses.map((u) => (
            <button
              key={u.key}
              type="button"
              aria-pressed={on[u.key]}
              onClick={() => setOn((s) => ({ ...s, [u.key]: !s[u.key] }))}
              className={toggle(on[u.key])}
            >
              <span className="font-display block text-lg font-semibold leading-tight">{u.title[locale]}</span>
              <span className={`mt-1 block text-base leading-snug ${on[u.key] ? "text-ink-900" : "text-bone-dim"}`}>
                {u.sub[locale]}
              </span>
            </button>
          ))}
        </div>

        <div className="min-w-0">
          <div aria-live="polite">
            <p className="text-base text-bone-dim">{t.storedLabel[locale]}</p>
            <p className="font-display mt-1 text-[clamp(1.75rem,3.6vw,3.5rem)] font-black leading-[1] tracking-[-0.02em] text-bone">
              {headline}
            </p>
            <ul className="mt-4 grid list-disc gap-1.5 pl-5 text-lg leading-snug text-bone marker:text-bone-dim">
              {n === 0 ? (
                <li>{t.nothingLine[locale]}</li>
              ) : (
                items.map((item) => <li key={item.ua}>{item[locale]}</li>)
              )}
            </ul>
          </div>
          <p className="mt-4 max-w-[520px] text-base leading-snug text-bone-dim">{t.demo[locale]}</p>

          <div className="mt-4 min-h-[88px]">
            {stage === "idle" ? (
              <button type="button" className="ghost-btn" onClick={() => setStage("confirm")}>
                {t.delete[locale]}
              </button>
            ) : null}
            {stage === "confirm" ? (
              <div role="group" aria-label={t.confirmText[locale]}>
                <p className="text-lg font-semibold leading-snug text-bone">{t.confirmText[locale]}</p>
                <div className="mt-3 flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    className="signal-btn"
                    onClick={() => {
                      deleteBrowserData();
                      setStage("done");
                    }}
                  >
                    {t.confirmYes[locale]}
                  </button>
                  <button type="button" className="ghost-btn" onClick={() => setStage("idle")}>
                    {t.confirmNo[locale]}
                  </button>
                </div>
              </div>
            ) : null}
            {stage === "done" ? (
              <p role="status" className="text-lg font-semibold leading-snug text-bone">
                {t.deleted[locale]}
              </p>
            ) : null}
          </div>
        </div>
      </section>
      <p data-privacy-end className="mt-4 max-w-[860px] text-base leading-snug text-bone-dim">
        {t.contact[locale]}
      </p>
    </div>
  );
}
