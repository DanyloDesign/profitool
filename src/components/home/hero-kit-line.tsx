"use client";

import { useI18n } from "@/i18n/context";
import { platformBySlug } from "@/data/taxonomy";
import { useMounted } from "@/lib/use-mounted";
import { usePlatform } from "@/store/shop";
import { IconBox } from "@/components/catalog/icon-box";

/**
 * The kit truth under the hero price for a tool sold without a battery (015). Once the buyer has
 * named this platform in "Мої батареї", the same line says the tool fits their batteries.
 */
export function HeroKitLine({ platform }: { platform: string }) {
  const { dict } = useI18n();
  const mounted = useMounted();
  const mine = usePlatform((state) => state.slug);
  const name = platformBySlug.get(platform)?.name ?? platform;
  const fits = mounted && mine === platform;

  return (
    <p className={`mt-3 flex items-start gap-2 text-[15px] leading-snug ${fits ? "text-stock" : "text-signal-text"}`}>
      <IconBox className="mt-px h-[18px] w-[18px] shrink-0" />
      <span>{fits ? dict.home.heroKitFits(name) : dict.home.heroKitBare(name)}</span>
    </p>
  );
}
