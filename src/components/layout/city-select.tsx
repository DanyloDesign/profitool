"use client";

import { useState } from "react";
import { useMounted } from "@/lib/use-mounted";
import { useI18n } from "@/i18n/context";
import { CITIES, cityName, isFastDelivery, useLocation } from "@/store/location";
import { usePopover } from "./use-popover";

function IconMapPin({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}

/**
 * Кнопка города доставки + поповер со списком городов и «Інше місто». Выбор пишется в
 * store/location и подставляется в чекаут. `fullWidth` — блочный вариант с рамкой для подвала
 * мега-меню (1024–1439px) и мобильного меню (<1024px). Инлайн-вариант в самой шапке (от 1440px) —
 * компактная текстовая кнопка без рамки: поиск в шапке главный, место экономим.
 */
export function CitySelect({ className = "", fullWidth = false }: { className?: string; fullWidth?: boolean }) {
  const { locale, dict } = useI18n();
  const mounted = useMounted();
  const citySlug = useLocation((state) => state.citySlug);
  const customCity = useLocation((state) => state.customCity);
  const setCity = useLocation((state) => state.setCity);
  const setCustomCity = useLocation((state) => state.setCustomCity);
  const { open, setOpen, rootRef, triggerRef } = usePopover();
  const [customValue, setCustomValue] = useState("");

  const label = mounted ? cityName(locale, { citySlug, customCity }) || dict.nav.cityCustom : CITIES[0].name[locale];

  return (
    <div ref={rootRef} className={`relative ${fullWidth ? "w-full" : ""} ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={`${dict.nav.city}: ${label}`}
        onClick={() => setOpen((value) => !value)}
        className={
          fullWidth
            ? "chip !h-11 w-full !justify-start gap-2"
            : "bar-btn shrink-0"
        }
      >
        <IconMapPin className="h-4 w-4 shrink-0" />
        <span className={`truncate ${fullWidth ? "" : "max-w-[64px] lg:max-w-[120px]"}`}>{label}</span>
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label={dict.nav.cityPopoverTitle}
          className="absolute left-0 top-[calc(100%+8px)] z-20 w-[280px] rounded-[24px] border border-[var(--hair-strong)] bg-ink-850 p-3 shadow-[var(--shadow-pop)]"
        >
          <p className="t-eyebrow px-2 pb-2 text-bone-dim">{dict.nav.cityPopoverTitle}</p>
          <ul className="grid gap-0.5">
            {CITIES.map((city) => (
              <li key={city.slug}>
                <button
                  type="button"
                  onClick={() => {
                    setCity(city.slug);
                    setOpen(false);
                    triggerRef.current?.focus();
                  }}
                  aria-pressed={citySlug === city.slug}
                  className={`flex w-full items-center justify-between gap-3 rounded-[16px] px-3 py-2.5 text-left text-[15px] transition-colors hover:bg-ink-700 ${
                    citySlug === city.slug ? "text-signal-text" : "text-bone"
                  }`}
                >
                  <span>{city.name[locale]}</span>
                  <span className="shrink-0 text-[13px] text-bone-dim">
                    {isFastDelivery(city.slug) ? dict.nav.cityDeliveryFast : dict.nav.cityDeliverySlow}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (!customValue.trim()) return;
              setCustomCity(customValue.trim());
              setOpen(false);
              triggerRef.current?.focus();
            }}
            className="mt-2 border-t border-[var(--hair)] pt-3"
          >
            <label htmlFor="city-select-custom" className="block px-1 text-[13px] text-bone-dim">
              {dict.nav.cityCustom}
            </label>
            <div className="mt-1.5 grid gap-2 px-1">
              <input
                id="city-select-custom"
                value={customValue}
                onChange={(event) => setCustomValue(event.target.value)}
                placeholder={dict.nav.cityCustomPlaceholder}
                className="field !h-11 w-full text-[15px]"
              />
              <button type="submit" className="ghost-btn btn-sm w-full">
                {dict.nav.cityCustomApply}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
