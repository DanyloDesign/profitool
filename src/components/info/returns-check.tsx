"use client";

import { useState, type CSSProperties } from "react";
import Link from "next/link";
import { RETURN_DAYS, returnsCheck as t } from "@/data/info";
import { useI18n } from "@/i18n/context";
import { href } from "@/lib/shop";

const MAX_DAYS = 30;

type AnswerKey = (typeof t.questions)[number]["key"];

/**
 * Returns page, direction B: a days slider and three yes/no questions on the left, one large
 * verdict on the right. First matching rule wins. Fits one desktop screen with the title.
 */
export function ReturnsCheck() {
  const { locale, dict } = useI18n();
  const [days, setDays] = useState(5);
  const [answers, setAnswers] = useState<Record<AnswerKey, boolean>>({ used: false, pack: true, broken: false });

  const v = t.verdicts;
  let verdict: { title: string; detail: string };
  let kind: "ok" | "warranty" | "other" = "other";
  if (answers.broken) {
    verdict = { title: v.warranty.title[locale], detail: v.warranty.detail[locale] };
    kind = "warranty";
  } else if (days > RETURN_DAYS) {
    verdict = { title: v.expired.title[locale], detail: v.expired.detail[locale] };
    kind = "warranty";
  } else if (answers.used) {
    verdict = { title: v.used.title[locale], detail: v.used.detail[locale] };
  } else if (!answers.pack) {
    verdict = { title: v.pack.title[locale], detail: v.pack.detail[locale] };
  } else {
    verdict = {
      title: v.ok.title[locale],
      detail: v.ok.detail[locale].replace("{left}", String(RETURN_DAYS - days)),
    };
    kind = "ok";
  }

  const pill = (on: boolean) =>
    `inline-flex h-11 min-w-16 items-center justify-center rounded-full border px-4 text-base font-semibold transition-colors ${
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
            <label htmlFor="returns-days" className="flex justify-between gap-4 text-base text-bone-dim">
              <span>{t.daysLabel[locale]}</span>
              <span className="font-semibold text-bone">
                {days} {t.daysUnit[locale]}
              </span>
            </label>
            <input
              id="returns-days"
              type="range"
              min={0}
              max={MAX_DAYS}
              step={1}
              value={days}
              onChange={(event) => setDays(Number(event.target.value))}
              className="delivery-range mt-2"
              style={{ "--fill": `${(days / MAX_DAYS) * 100}%` } as CSSProperties}
            />
          </div>
          {t.questions.map((q) => (
            <div
              key={q.key}
              role="group"
              aria-label={q.text[locale]}
              className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2"
            >
              <span className="text-base text-bone">{q.text[locale]}</span>
              <span className="flex gap-1.5">
                <button
                  type="button"
                  aria-pressed={answers[q.key]}
                  onClick={() => setAnswers((a) => ({ ...a, [q.key]: true }))}
                  className={pill(answers[q.key])}
                >
                  {t.yes[locale]}
                </button>
                <button
                  type="button"
                  aria-pressed={!answers[q.key]}
                  onClick={() => setAnswers((a) => ({ ...a, [q.key]: false }))}
                  className={pill(!answers[q.key])}
                >
                  {t.no[locale]}
                </button>
              </span>
            </div>
          ))}
        </div>

        <div aria-live="polite" className="min-w-0">
          <p className="text-base text-bone-dim">{t.answerLabel[locale]}</p>
          <p
            className={`font-display mt-1 text-[clamp(1.75rem,3.6vw,3.5rem)] font-black leading-[1] tracking-[-0.02em] ${
              kind === "ok" ? "text-bone" : "text-signal-text"
            }`}
          >
            {verdict.title}
          </p>
          <p className="mt-3 max-w-[460px] text-lg leading-snug text-bone">{verdict.detail}</p>
          {kind === "ok" ? (
            <div className="mt-5 flex flex-wrap gap-2.5">
              <a href={`tel:${dict.common.phone.replace(/\s/g, "")}`} className="signal-btn">
                {t.call[locale]} {dict.common.phone}
              </a>
              <Link href={href(locale, "/info/delivery")} className="ghost-btn">
                {t.store[locale]}
              </Link>
            </div>
          ) : null}
          {kind === "warranty" ? (
            <Link href={href(locale, "/info/warranty")} className="ghost-btn mt-5">
              {t.warrantyLink[locale]}
            </Link>
          ) : null}
        </div>
      </section>
      <p data-returns-end className="mt-4 max-w-[860px] text-base leading-snug text-bone-dim">
        {t.refund[locale]}
      </p>
    </div>
  );
}
