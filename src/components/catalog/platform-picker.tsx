"use client";

import Link from "next/link";
import { useMounted } from "@/lib/use-mounted";
import { useI18n } from "@/i18n/context";
import { platforms } from "@/data/taxonomy";
import { href } from "@/lib/shop";
import { usePlatform } from "@/store/shop";
import { IconArrow } from "@/components/ui/icons";

/**
 * Главная фича магазина: покупатель отмечает платформу, которая у него уже есть,
 * и дальше видит только совместимый инструмент. Выбор живёт между визитами.
 */
export function PlatformPicker() {
  const { locale, dict } = useI18n();
  const mounted = useMounted();
  const selected = usePlatform((state) => state.slug);
  const choose = usePlatform((state) => state.set);

  const active = mounted ? selected : null;

  return (
    <section id="platform" className="border-t border-[var(--hair)] pt-10">
      <h2 className="t-h2 text-bone">{dict.home.platformPick}</h2>
      <p className="mt-2 text-base text-bone-dim">{dict.home.platformText}</p>

      <div className="mt-6 flex flex-wrap gap-2.5">
        {platforms.map((platform) => {
          const isActive = active === platform.slug;
          return (
            <button
              key={platform.slug}
              type="button"
              onClick={() => choose(isActive ? null : platform.slug)}
              aria-pressed={isActive}
              className="chip !h-11 !px-5"
            >
              {platform.name}
            </button>
          );
        })}
      </div>

      {active ? (
        <Link href={`${href(locale, "/catalog")}?platform=${active}`} className="signal-btn mt-8">
          {dict.catalog.apply}
          <IconArrow className="h-[18px] w-[18px]" />
        </Link>
      ) : null}
    </section>
  );
}
