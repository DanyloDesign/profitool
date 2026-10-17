"use client";

import { useState, type CSSProperties } from "react";
import Link from "next/link";
import { WARRANTY_TERMS, warrantyCheck as t, type WarrantyIssueKey } from "@/data/info";
import { useI18n } from "@/i18n/context";
import { href } from "@/lib/shop";

const MAX_MONTHS = 48;

/**
 * Warranty page, direction B: term pills, months slider and issue pills on the left, one large
 * verdict with the remaining-term bar on the right. Fits one desktop screen with the title.
 */
export function WarrantyCheck() {
  const { locale, dict } = useI18n();
  const [term, setTerm] = useState<number>(36);
  const [months, setMonths] = useState(8);
  const [issue, setIssue] = useState<WarrantyIssueKey>("fault");

  const phone = dict.common.phone;
  const left = term - months;
  const inTerm = left > 0;
  const covered = inTerm && issue === "fault";
  const v = t.verdicts;

  let verdict: { title: string; detail: string };
  if (!inTerm) {
    verdict = { title: v.expired.title[locale], detail: v.expired.detail[locale].replace("{phone}", phone) };
  } else if (issue === "damage") {
    verdict = { title: v.damage.title[locale], detail: v.damage.detail[locale] };
  } else if (issue === "wear") {
    verdict = { title: v.wear.title[locale], detail: v.wear.detail[locale] };
  } else {
    verdict = { title: v.covered.title[locale], detail: v.covered.detail[locale] };
  }
  const kicker = inTerm
    ? t.kickerLeft[locale].replace("{left}", String(left))
    : t.kickerExpired[locale].replace("{term}", String(term));
  const pct = Math.max(0, Math.min(100, Math.round((left / term) * 100)));

  const pill = (on: boolean) =>
    `inline-flex h-11 items-center justify-center rounded-full border px-4 text-base font-semibold transition-colors ${
      on ? "border-bone bg-bone text-ink-900" : "border-[var(--hair-strong)] bg-transparent text-bone hover:border-bone"
    }`;

  return (
    <div>
      <section
        aria-label={t.sectionLabel[locale]}
        className="mt-5 grid gap-x-16 gap-y-6 border-y border-[var(--hair)] py-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]"
      >
        <div className="flex min-w-0 flex-col gap-4">
          <div>
            <p className="text-base text-bone-dim">{t.termLabel[locale]}</p>
            <div role="group" aria-label={t.termLabel[locale]} className="mt-2 flex flex-wrap gap-2">
              {WARRANTY_TERMS.map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={value === term}
                  onClick={() => setTerm(value)}
                  className={pill(value === term)}
                >
                  {value} {t.monthsUnit[locale]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="warranty-months" className="flex justify-between gap-4 text-base text-bone-dim">
              <span>{t.monthsLabel[locale]}</span>
              <span className="font-semibold text-bone">
                {months} {t.monthsUnit[locale]}
              </span>
            </label>
            <input
              id="warranty-months"
              type="range"
              min={0}
              max={MAX_MONTHS}
              step={1}
              value={months}
              onChange={(event) => setMonths(Number(event.target.value))}
              className="delivery-range mt-2"
              style={{ "--fill": `${(months / MAX_MONTHS) * 100}%` } as CSSProperties}
            />
          </div>
          <div>
            <p className="text-base text-bone-dim">{t.issueLabel[locale]}</p>
            <div role="group" aria-label={t.issueLabel[locale]} className="mt-2 flex flex-wrap gap-2">
              {t.issues.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  aria-pressed={item.key === issue}
                  onClick={() => setIssue(item.key)}
                  className={pill(item.key === issue)}
                >
                  {item.label[locale]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div aria-live="polite" className="min-w-0">
          <p className="text-base text-bone-dim">{kicker}</p>
          <p
            className={`font-display mt-1 text-[clamp(1.75rem,3.6vw,3.5rem)] font-black leading-[1] tracking-[-0.02em] ${
              covered ? "text-bone" : "text-signal-text"
            }`}
          >
            {verdict.title}
          </p>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
            aria-label={kicker}
            className="mt-4 h-2.5 overflow-hidden rounded-full bg-[var(--hair-strong)]"
          >
            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundImage: "var(--grad-brand)" }} />
          </div>
          <p className="mt-3 max-w-[460px] text-lg leading-snug text-bone">{verdict.detail}</p>
          {covered ? (
            <ol className="mt-4 grid list-none gap-2.5 p-0">
              {t.steps.map((step, i) => (
                <li key={step.ua} className="flex items-baseline gap-3.5 text-base leading-snug text-bone">
                  <span
                    className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-base font-semibold text-black"
                    style={{ backgroundImage: "var(--grad-brand)" }}
                  >
                    {i + 1}
                  </span>
                  <span>{step[locale].replace("{phone}", phone)}</span>
                </li>
              ))}
            </ol>
          ) : null}
          {issue === "wear" && inTerm ? (
            <Link href={href(locale, "/catalog")} className="ghost-btn mt-4">
              {t.catalogLink[locale]}
            </Link>
          ) : null}
        </div>
      </section>
      <p data-warranty-end className="mt-4 max-w-[860px] text-base leading-snug text-bone-dim">
        {t.notCovered[locale]}
      </p>
    </div>
  );
}
