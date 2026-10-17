"use client";

import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import Link from "next/link";
import {
  RETURN_CLAIMS_KEY,
  RETURN_DAYS,
  returnsCheck as t,
  type ReturnChannelKey,
  type ReturnStateKey,
  type ReturnVerdictKey,
} from "@/data/info";
import { useI18n } from "@/i18n/context";
import { normalizePhone } from "@/lib/phone";
import { href } from "@/lib/shop";
import { useMounted } from "@/lib/use-mounted";
import { useLastOrder } from "@/store/shop";

const MAX_DAYS = 30;

type Screen = "verdict" | "form" | "sent";
type Errors = { phone?: string; reason?: string; card?: string };

/**
 * Returns page, rebuilt on returns-logic.md: how it was bought, what happened, days since
 * receipt. One verdict with its facts on the right; "Заповнити заяву" swaps that column for an
 * inline claim form, then for the "what next" steps. The claim is saved to localStorage only.
 */
export function ReturnsCheck() {
  const { locale, dict } = useI18n();
  const mounted = useMounted();
  const lastOrder = useLastOrder((s) => s.number);

  const [channel, setChannel] = useState<ReturnChannelKey>("online");
  const [state, setState] = useState<ReturnStateKey>("fine");
  const [days, setDays] = useState(6);
  const [screen, setScreen] = useState<Screen>("verdict");

  // null means "not typed yet": the field then shows the latest order number, if there is one.
  const [order, setOrder] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("");
  const [card, setCard] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  const formHead = useRef<HTMLHeadingElement>(null);
  const sentHead = useRef<HTMLHeadingElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const reasonRef = useRef<HTMLTextAreaElement>(null);
  const cardRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (screen === "form") formHead.current?.focus();
    if (screen === "sent") sentHead.current?.focus();
  }, [screen]);

  const online = channel === "online";
  let key: ReturnVerdictKey;
  if (state === "broken") key = "broken";
  else if (state === "damaged") key = "damaged";
  else if (days > RETURN_DAYS) key = online ? "expiredOnline" : "expiredStore";
  else key = online ? "okOnline" : "okStore";
  const verdict = t.verdicts[key];
  const good = key === "okOnline" || key === "okStore";
  const left = String(RETURN_DAYS - days);

  const pick = <T,>(set: (value: T) => void, value: T) => {
    set(value);
    setScreen("verdict");
  };

  const pill = (on: boolean) =>
    `inline-flex h-11 items-center justify-center rounded-full border px-4 text-base font-semibold transition-colors ${
      on ? "border-bone bg-bone text-ink-900" : "border-[var(--hair-strong)] bg-transparent text-bone hover:border-bone"
    }`;

  const orderValue = order ?? (mounted ? (lastOrder ?? "") : "");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const next: Errors = {};
    const normalized = normalizePhone(phone);
    if (!normalized) next.phone = dict.checkout.errPhone;
    if (!reason.trim()) next.reason = t.form.errReason[locale];
    const digits = card.replace(/\s/g, "");
    if (card.trim() && (!/^[\d\s]+$/.test(card) || digits.length !== 16)) next.card = t.form.errCard[locale];
    setErrors(next);
    if (next.phone) return void phoneRef.current?.focus();
    if (next.reason) return void reasonRef.current?.focus();
    if (next.card) return void cardRef.current?.focus();

    try {
      const raw = localStorage.getItem(RETURN_CLAIMS_KEY);
      const list: unknown = raw ? JSON.parse(raw) : [];
      const claims = Array.isArray(list) ? list : [];
      // The card is kept as its last four digits: a demo claim has no reason to hold a full number.
      claims.push({
        order: orderValue.trim(),
        phone: normalized,
        reason: reason.trim(),
        cardLast4: digits ? digits.slice(-4) : null,
        channel,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem(RETURN_CLAIMS_KEY, JSON.stringify(claims));
    } catch {
      // Storage blocked: the demo still shows the next steps.
    }
    setScreen("sent");
  };

  const label = "block text-[15px] text-bone-dim";
  const errorLine = (id: string, message?: string) =>
    message ? (
      <p id={`${id}-error`} role="alert" className="mt-1 text-sm text-warn">
        {message}
      </p>
    ) : null;

  return (
    <div>
      <section
        aria-label={t.sectionLabel[locale]}
        className="mt-5 grid gap-x-16 gap-y-6 border-y border-[var(--hair)] py-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]"
      >
        <div className="flex min-w-0 flex-col gap-4">
          <div>
            <p className="text-base text-bone-dim">1. {t.channelLabel[locale]}</p>
            <div role="group" aria-label={t.channelLabel[locale]} className="mt-2 flex flex-wrap gap-2">
              {t.channels.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  aria-pressed={c.key === channel}
                  onClick={() => pick(setChannel, c.key)}
                  className={pill(c.key === channel)}
                >
                  {c.label[locale]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-base text-bone-dim">2. {t.stateLabel[locale]}</p>
            <div role="group" aria-label={t.stateLabel[locale]} className="mt-2 flex flex-wrap gap-2">
              {t.states.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  aria-pressed={s.key === state}
                  onClick={() => pick(setState, s.key)}
                  className={pill(s.key === state)}
                >
                  {s.label[locale]}
                </button>
              ))}
            </div>
          </div>
          {state === "fine" ? (
            <div>
              <label htmlFor="returns-days" className="flex justify-between gap-4 text-base text-bone-dim">
                <span>3. {online ? t.daysLabelOnline[locale] : t.daysLabelStore[locale]}</span>
                <span className="shrink-0 font-semibold text-bone">
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
                onChange={(event) => pick(setDays, Number(event.target.value))}
                className="delivery-range mt-2"
                style={{ "--fill": `${(days / MAX_DAYS) * 100}%` } as CSSProperties}
              />
            </div>
          ) : null}
        </div>

        <div aria-live="polite" className="min-w-0">
          {screen === "verdict" ? (
            <>
              <p className="text-base text-bone-dim">{t.answerLabel[locale]}</p>
              <p
                className={`font-display mt-1 text-[clamp(1.75rem,3.6vw,3.5rem)] font-black leading-[1] tracking-[-0.02em] ${
                  good ? "text-bone" : "text-signal-text"
                }`}
              >
                {verdict.title[locale]}
              </p>
              <ul className="mt-3 grid list-disc gap-1.5 pl-5 text-base leading-snug text-bone">
                {verdict.facts.map((fact) => (
                  <li key={fact.ua}>{fact[locale].replace("{left}", left)}</li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap gap-2.5">
                {key === "okOnline" ? (
                  <button type="button" onClick={() => setScreen("form")} className="signal-btn">
                    {t.claim[locale]}
                  </button>
                ) : null}
                {key === "broken" ? (
                  <Link href={href(locale, "/info/warranty")} className="signal-btn">
                    {t.warrantyLink[locale]}
                  </Link>
                ) : null}
                <a href={`tel:${dict.common.phone.replace(/\s/g, "")}`} className="ghost-btn">
                  {dict.common.phone}
                </a>
              </div>
            </>
          ) : null}

          {screen === "form" ? (
            <form onSubmit={submit} noValidate className="grid gap-2.5">
              <h2
                ref={formHead}
                tabIndex={-1}
                className="font-display text-[1.375rem] font-semibold leading-tight text-bone outline-none"
              >
                {t.form.title[locale]}
              </h2>
              <div className="grid gap-x-3 gap-y-2.5 sm:grid-cols-2">
                <div>
                  <label htmlFor="claim-order" className={label}>
                    {t.form.order[locale]}
                  </label>
                  <input
                    id="claim-order"
                    type="text"
                    autoComplete="off"
                    placeholder={t.form.orderPlaceholder}
                    value={orderValue}
                    onChange={(event) => setOrder(event.target.value)}
                    className="field mt-1 h-11"
                  />
                </div>
                <div>
                  <label htmlFor="claim-phone" className={label}>
                    {t.form.phone[locale]}
                  </label>
                  <input
                    ref={phoneRef}
                    id="claim-phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="+380"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    className="field mt-1 h-11"
                    aria-invalid={!!errors.phone}
                    aria-describedby={errors.phone ? "claim-phone-error" : undefined}
                  />
                  {errorLine("claim-phone", errors.phone)}
                </div>
              </div>
              <div>
                <label htmlFor="claim-reason" className={label}>
                  {t.form.reason[locale]}
                </label>
                <textarea
                  ref={reasonRef}
                  id="claim-reason"
                  rows={2}
                  placeholder={t.form.reasonPlaceholder[locale]}
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  className="field field-area mt-1 py-2.5"
                  aria-invalid={!!errors.reason}
                  aria-describedby={errors.reason ? "claim-reason-error" : undefined}
                />
                {errorLine("claim-reason", errors.reason)}
              </div>
              <div>
                <label htmlFor="claim-card" className={label}>
                  {t.form.card[locale]}
                </label>
                <input
                  ref={cardRef}
                  id="claim-card"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder={t.form.cardPlaceholder}
                  value={card}
                  onChange={(event) => setCard(event.target.value)}
                  className="field mt-1 h-11"
                  aria-invalid={!!errors.card}
                  aria-describedby={errors.card ? "claim-card-error" : undefined}
                />
                {errorLine("claim-card", errors.card)}
              </div>
              <div className="mt-1 flex flex-wrap gap-2.5">
                <button type="submit" className="signal-btn">
                  {t.form.send[locale]}
                </button>
                <button type="button" onClick={() => setScreen("verdict")} className="ghost-btn">
                  {t.form.back[locale]}
                </button>
              </div>
            </form>
          ) : null}

          {screen === "sent" ? (
            <>
              <p className="text-base text-bone-dim">{t.sent.kicker[locale]}</p>
              <h2
                ref={sentHead}
                tabIndex={-1}
                className="font-display mt-1 text-[clamp(1.75rem,3.6vw,3.5rem)] font-black leading-[1] tracking-[-0.02em] text-bone outline-none"
              >
                {t.sent.title[locale]}
              </h2>
              <ol className="mt-4 grid list-none gap-2.5 p-0">
                {t.sent.steps.map((step, i) => (
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
              <p className="mt-4 text-base leading-snug text-bone-dim">{t.sent.demo[locale]}</p>
            </>
          ) : null}
        </div>
      </section>
      <p data-returns-end className="mt-4 max-w-[860px] text-base leading-snug text-bone-dim">
        {t.seller[locale].replace("{phone}", dict.common.phone.replace(/ /g, " "))}
      </p>
    </div>
  );
}
