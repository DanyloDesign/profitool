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
 * `variant="bar"` (default, 015): a quiet icon button of the header utility cluster (from 768px),
 * the handset only; the name comes from aria-label and title. The popover opens from the button's
 * right edge because the cluster sits near the right edge of the header. `variant="full"`: the
 * block chip of the phone menu (<768px), as before.
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
        className={full ? "chip !h-11 w-full !justify-start gap-2" : "bar-btn w-11 shrink-0 !px-0"}
      >
        <IconPhone className={full ? "h-4 w-4 shrink-0" : "h-[18px] w-[18px] shrink-0"} />
        {full ? (
          <>
            <span>{dict.nav.support}</span>
            <IconChevron className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
          </>
        ) : null}
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label={dict.nav.support}
          className={`absolute top-[calc(100%+8px)] z-20 w-[260px] ${full ? "left-0" : "right-0"} rounded-[24px] border border-[var(--hair-strong)] bg-ink-850 p-4 shadow-[var(--shadow-pop)]`}
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
