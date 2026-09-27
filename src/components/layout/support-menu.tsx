"use client";

import { useI18n } from "@/i18n/context";
import { IconChevron, IconPhone } from "@/components/ui/icons";
import { usePopover } from "./use-popover";

/**
 * Телефон и график работы из подвала (footer.tsx их не отдаёт как хук, поэтому дублируем
 * значения из dict.common — секцию common мы не трогаем, только читаем).
 * Пункты меню из референса «Замовити дзвінок», «Гарантія і сервіс», «Повернення і обмін»,
 * «Оптовим клієнтам» не добавлены: под них нет страниц в проекте (см. заметки в impl-b4).
 *
 * `variant="bar"` (по умолчанию) — окантована пілюля з 006 для першого шару шапки (₴768px):
 * іконка завжди, підпис і шеврон ховаються нижче lg, щоб влізти на планшеті. `variant="full"` —
 * блочний чіп для подвалу мобільного меню (<768px), як і раніше.
 */
export function SupportMenu({
  className = "",
  variant = "bar",
}: {
  className?: string;
  variant?: "bar" | "full";
}) {
  const { dict } = useI18n();
  const { open, setOpen, rootRef, triggerRef } = usePopover();
  const full = variant === "full";

  const phoneHref = `tel:${dict.common.phone.replace(/[^\d+]/g, "")}`;

  return (
    <div ref={rootRef} className={`relative ${full ? "w-full" : ""} ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={dict.nav.support}
        title={dict.nav.support}
        onClick={() => setOpen((value) => !value)}
        className={full ? "chip !h-11 w-full !justify-start gap-2" : "ghost-btn btn-sm shrink-0 gap-1.5 !px-3"}
      >
        <IconPhone className="h-4 w-4 shrink-0" />
        <span className={full ? "" : "hidden lg:inline"}>{dict.nav.support}</span>
        <IconChevron
          className={`h-3.5 w-3.5 shrink-0 transition-transform ${full ? "" : "hidden lg:inline"} ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label={dict.nav.support}
          className="absolute left-0 top-[calc(100%+8px)] z-20 w-[260px] rounded-[24px] border border-[var(--hair-strong)] bg-ink-850 p-4 shadow-[var(--shadow-pop)]"
        >
          <a
            href={phoneHref}
            onClick={() => setOpen(false)}
            className="t-price block text-xl text-bone transition-colors hover:text-signal-text"
          >
            {dict.common.phone}
          </a>
          <p className="mt-2 text-[14px] leading-relaxed text-bone-dim">
            {dict.nav.supportHoursTitle}:{" "}
            {/* Не переносим часы посреди диапазона (обзор round 2, #10): дефис/двоеточие из
                dict.common — секцию common не трогаем, поэтому держим без переноса через CSS. */}
            <span className="whitespace-nowrap">{dict.common.footerHours}</span>
          </p>
          <a href={phoneHref} onClick={() => setOpen(false)} className="ghost-btn btn-sm mt-4 w-full">
            {dict.nav.supportCall}
          </a>
        </div>
      ) : null}
    </div>
  );
}
