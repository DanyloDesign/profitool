"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/i18n/context";
import { brandBySlug, categories, platforms } from "@/data/taxonomy";
import { categoryHref, categoryPhoto, countForPlatform, href } from "@/lib/shop";
import { usePlatform } from "@/store/shop";

/**
 * The "Каталог" panel from 1024px (015): sections as real product photos with a one-line blurb,
 * and the battery platforms named with their brand ("Makita · LXT 18V"). Picking a platform also
 * remembers it as "Мої батареї", so the header chip and the cards pick it up.
 */
export function MegaMenu({ id, onClose }: { id: string; onClose: () => void }) {
  const { locale, dict } = useI18n();
  const setPlatform = usePlatform((state) => state.set);

  return (
    <>
      <div aria-hidden className="hdr-scrim" onClick={onClose} />
      <div id={id} className="hdr-mega absolute inset-x-0 top-full border-b border-[var(--hair)] bg-ink-900 shadow-[var(--shadow-pop)]">
        <div className="shell grid grid-cols-[minmax(0,1fr)_340px] gap-12 pb-8 pt-5 min-[1400px]:gap-14">
          <ul className="grid grid-cols-2 content-start gap-x-6 gap-y-1">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link
                  href={categoryHref(locale, category.slug)}
                  onClick={onClose}
                  className="flex items-center gap-3.5 rounded-[20px] p-3 transition-colors duration-[var(--dur-fast)] hover:bg-ink-800"
                >
                  <span className="relative h-[72px] w-[72px] shrink-0">
                    <Image src={categoryPhoto(category.slug)} alt="" fill sizes="72px" className="object-contain" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[17px] font-medium leading-snug text-bone">{category.name[locale]}</span>
                    <span className="mt-0.5 block text-sm leading-snug text-bone-dim">{category.blurb[locale]}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="border-l border-[var(--hair)] pl-8 pt-3">
            <p className="text-sm text-bone-dim">{dict.header.platformsTitle}</p>
            <ul className="mt-2">
              {platforms.map((platform) => (
                <li key={platform.slug}>
                  <Link
                    href={`${href(locale, "/catalog")}?platform=${platform.slug}`}
                    onClick={() => {
                      setPlatform(platform.slug);
                      onClose();
                    }}
                    className="flex h-11 items-center justify-between gap-3 border-b border-[var(--hair)] px-1 text-[15px] text-bone transition-colors duration-[var(--dur-fast)] hover:text-bone-dim"
                  >
                    <span className="truncate">
                      <span className="text-bone-dim">{brandBySlug.get(platform.brand)?.name}</span> · {platform.name}
                    </span>
                    <span className="shrink-0 text-sm text-bone-faint">{dict.header.tools(countForPlatform(platform.slug))}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
