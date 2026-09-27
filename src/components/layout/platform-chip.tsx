"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/context";
import { brandBySlug, platformBySlug, platforms } from "@/data/taxonomy";
import { countForPlatform, href } from "@/lib/shop";
import { useMounted } from "@/lib/use-mounted";
import { usePlatform } from "@/store/shop";
import { IconArrow, IconBattery } from "@/components/ui/icons";
import { usePopover } from "./use-popover";

/**
 * "Мої батареї" in the header (015, pattern 4): the battery platform the buyer picked once, shown
 * as a quiet stock-coloured chip. Hidden until the store is read from localStorage and while no
 * platform is picked. The popover changes or clears the platform and leads to the compatible
 * tools. Below 1400px the chip shows the battery only; the name is in aria-label and title.
 */
export function PlatformChip() {
  const { locale, dict } = useI18n();
  const mounted = useMounted();
  const slug = usePlatform((state) => state.slug);
  const setPlatform = usePlatform((state) => state.set);
  const { open, setOpen, rootRef, triggerRef } = usePopover();

  const platform = mounted && slug ? platformBySlug.get(slug) : undefined;
  if (!platform) return null;

  const fullName = `${brandBySlug.get(platform.brand)?.name ?? ""} ${platform.name}`.trim();
  const label = `${dict.header.myBatteries}: ${fullName}`;

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={label}
        title={label}
        onClick={() => setOpen((value) => !value)}
        className="bar-btn hdr-platform shrink-0"
      >
        <IconBattery className="h-[18px] w-[18px] shrink-0" />
        <span className="hidden min-[1400px]:inline">{platform.name}</span>
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label={dict.header.myBatteries}
          className="absolute right-0 top-[calc(100%+8px)] z-20 w-[320px] rounded-[24px] border border-[var(--hair)] bg-ink-900 p-2 shadow-[var(--shadow-pop)]"
        >
          <p className="px-3 pb-1 pt-2 text-sm text-bone-dim">{dict.header.myBatteries}</p>
          <ul>
            {platforms.map((item) => {
              const selected = item.slug === platform.slug;
              return (
                <li key={item.slug}>
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => {
                      setPlatform(item.slug);
                      setOpen(false);
                      triggerRef.current?.focus();
                    }}
                    className={`flex h-11 w-full items-center gap-2 rounded-[16px] px-3 text-left text-[15px] transition-colors duration-[var(--dur-fast)] hover:bg-ink-800 ${
                      selected ? "bg-ink-800" : ""
                    }`}
                  >
                    <span className="w-[88px] shrink-0 text-bone-dim">{brandBySlug.get(item.brand)?.name}</span>
                    <span className={`font-medium ${selected ? "text-stock" : "text-bone"}`}>{item.name}</span>
                    <span className="ml-auto shrink-0 text-sm text-bone-faint">{countForPlatform(item.slug)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="mt-1 grid border-t border-[var(--hair)] pt-1">
            <Link
              href={`${href(locale, "/catalog")}?platform=${platform.slug}`}
              onClick={() => setOpen(false)}
              className="flex h-11 items-center gap-2 rounded-[16px] px-3 text-[15px] font-medium text-bone transition-colors duration-[var(--dur-fast)] hover:bg-ink-800"
            >
              {dict.header.showTools(countForPlatform(platform.slug))}
              <IconArrow className="h-4 w-4 shrink-0" />
            </Link>
            <button
              type="button"
              onClick={() => {
                setPlatform(null);
                setOpen(false);
              }}
              className="flex h-11 items-center rounded-[16px] px-3 text-left text-[15px] text-bone-dim transition-colors duration-[var(--dur-fast)] hover:bg-ink-800"
            >
              {dict.header.noBatteries}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
