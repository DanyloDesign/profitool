"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { useMounted } from "@/lib/use-mounted";
import { useI18n } from "@/i18n/context";
import { brandBySlug, platformBySlug, platforms } from "@/data/taxonomy";
import { countForPlatform, href } from "@/lib/shop";
import { usePlatform } from "@/store/shop";
import { IconArrow, IconBattery, IconCheck, IconChevron } from "@/components/ui/icons";

const brandName = (slug: string) => brandBySlug.get(slug)?.name ?? slug;

/** Every platform as "Brand · Line" with the number of tools that take its batteries. */
const PLATFORM_OPTIONS = platforms.map((platform) => ({
  slug: platform.slug as string | null,
  brand: brandName(platform.brand),
  line: platform.name,
  count: countForPlatform(platform.slug),
}));

/**
 * "Мої батареї" (015): one row under the hero. The buyer names the battery platform they already
 * own; cards of that platform then say "до твоїх батарей" and the catalog link filters by it.
 * The choice lives in the `profitool-platform` store between visits.
 *
 * A button with a listbox: ↑↓ Home End move, Enter or Space picks, Esc closes; focus returns to
 * the button. Desktop shows the list as a popover under the button, phones as a full-width list.
 */
export function PlatformPicker() {
  const { locale, dict } = useI18n();
  const mounted = useMounted();
  const selected = usePlatform((state) => state.slug);
  const choose = usePlatform((state) => state.set);
  const active = mounted ? selected : null;

  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const id = useId();

  const options = [...PLATFORM_OPTIONS, { slug: null, brand: "", line: dict.home.batteriesNo, count: 0 }];
  const current = active ? platformBySlug.get(active) : undefined;
  const label = current ? `${brandName(current.brand)} ${current.name}` : dict.home.batteriesNone;
  const count = active ? countForPlatform(active) : 0;

  useEffect(() => {
    if (!open) return;
    listRef.current?.focus();
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const openList = () => {
    const index = options.findIndex((option) => option.slug === active);
    setCursor(active && index >= 0 ? index : 0);
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    buttonRef.current?.focus();
  };

  const pick = (index: number) => {
    choose(options[index].slug);
    close();
  };

  const onListKey = (event: KeyboardEvent<HTMLUListElement>) => {
    const last = options.length - 1;
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setCursor((value) => Math.min(value + 1, last));
        break;
      case "ArrowUp":
        event.preventDefault();
        setCursor((value) => Math.max(value - 1, 0));
        break;
      case "Home":
        event.preventDefault();
        setCursor(0);
        break;
      case "End":
        event.preventDefault();
        setCursor(last);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        pick(cursor);
        break;
      case "Escape":
        event.preventDefault();
        event.stopPropagation();
        close();
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  };

  // Phones: help on its own line until a platform is chosen, then the catalog link instead.
  // From 1024px everything sits in one row.
  const helpClass = active ? "hidden lg:block" : "w-full md:hidden lg:block lg:w-auto";

  return (
    <section aria-labelledby={`${id}-label`} className="border-y border-[var(--hair)]">
      <div
        ref={rootRef}
        className="relative flex flex-wrap items-center gap-x-3 gap-y-1 py-3 md:min-h-[88px] md:flex-nowrap md:gap-x-4 md:py-2"
      >
        <IconBattery className={`h-6 w-6 shrink-0 ${active ? "text-stock" : "text-signal-text"}`} />
        <span id={`${id}-label`} className="shrink-0 text-base font-medium text-bone md:text-[17px]">
          {dict.home.batteries}
        </span>

        <div className="min-w-0 flex-1 md:relative md:flex-none">
          <button
            ref={buttonRef}
            id={`${id}-button`}
            type="button"
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={open ? `${id}-list` : undefined}
            aria-labelledby={`${id}-label ${id}-button`}
            data-chosen={active ? "" : undefined}
            onClick={() => (open ? setOpen(false) : openList())}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                event.preventDefault();
                openList();
              }
            }}
            className="pp-trigger ghost-btn btn-sm max-w-full !pl-[18px] !pr-3.5 !text-base"
          >
            <span className="truncate">{label}</span>
            <IconChevron
              className={`h-4 w-4 shrink-0 transition-transform duration-[var(--dur-fast)] ${open ? "-rotate-90" : "rotate-90"}`}
              strokeWidth={2}
            />
          </button>

          {open ? (
            <ul
              ref={listRef}
              id={`${id}-list`}
              role="listbox"
              tabIndex={-1}
              aria-labelledby={`${id}-label`}
              aria-activedescendant={`${id}-option-${cursor}`}
              onKeyDown={onListKey}
              className="absolute inset-x-0 top-full z-30 mt-2 flex flex-col rounded-[24px] border border-[var(--hair)] bg-ink-900 p-2 shadow-[var(--shadow-pop)] outline-none md:inset-x-auto md:left-0 md:w-[384px]"
            >
              {options.map((option, index) => {
                const isSelected = option.slug !== null && option.slug === active;
                const none = option.slug === null;
                return (
                  <li
                    key={option.slug ?? "none"}
                    id={`${id}-option-${index}`}
                    role="option"
                    aria-selected={isSelected}
                    data-active={index === cursor ? "" : undefined}
                    onClick={() => pick(index)}
                    onPointerMove={() => setCursor(index)}
                    className={`relative flex h-12 cursor-pointer items-center gap-2 rounded-2xl px-3 data-[active]:bg-ink-800 md:gap-2.5 md:px-3.5 ${
                      none
                        ? "mt-2 text-[15px] text-bone-dim before:absolute before:inset-x-3 before:-top-1 md:before:inset-x-3.5 before:h-px before:bg-[var(--hair)]"
                        : "text-[15px] text-bone md:text-base"
                    }`}
                  >
                    {none ? (
                      option.line
                    ) : (
                      <>
                        <span className="w-[78px] shrink-0 text-bone-dim md:w-[92px]">{option.brand}</span>
                        <span className="truncate font-medium">{option.line}</span>
                        <span className="ml-auto inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-sm text-bone-faint">
                          {dict.home.batteriesCount(option.count)}
                          {isSelected ? <IconCheck className="h-[18px] w-[18px] text-stock" strokeWidth={2.2} /> : null}
                        </span>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>

        <span className={`min-w-0 text-sm text-bone-dim lg:truncate lg:text-[15px] ${helpClass}`}>
          {active ? dict.home.batteriesHelpChosen : dict.home.batteriesHelp}
        </span>

        {active ? (
          <Link
            href={`${href(locale, "/catalog")}?platform=${active}`}
            className="inline-flex h-11 shrink-0 items-center gap-2 whitespace-nowrap text-[15px] font-medium text-signal-text transition-colors hover:text-bone md:ml-auto"
          >
            {dict.home.batteriesShow(count)}
            <IconArrow className="h-4 w-4" strokeWidth={2} />
          </Link>
        ) : null}
      </div>
    </section>
  );
}
