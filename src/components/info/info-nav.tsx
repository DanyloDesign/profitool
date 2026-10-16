import Link from "next/link";
import type { Locale } from "@/i18n";
import { infoPages, type InfoSlug } from "@/data/info";
import { href } from "@/lib/shop";

/**
 * The five information pages. From 1024px a quiet sticky list (current page in bone, the rest
 * in bone-dim); below that a chip row that scrolls inside itself, so the page never scrolls sideways.
 * Server component: it receives the locale string only.
 */
export function InfoNav({ locale, current, label }: { locale: Locale; current: InfoSlug; label: string }) {
  return (
    <nav aria-label={label}>
      <ul className="-mx-[var(--gutter)] flex gap-2 overflow-x-auto px-[var(--gutter)] pb-1 lg:hidden">
        {infoPages.map((page) => (
          <li key={page.slug} className="shrink-0">
            <Link
              href={href(locale, `/info/${page.slug}`)}
              className="chip"
              data-on={page.slug === current}
              aria-current={page.slug === current ? "page" : undefined}
            >
              {page.title[locale]}
            </Link>
          </li>
        ))}
      </ul>
      <ul className="hidden gap-3 lg:grid">
        {infoPages.map((page) => (
          <li key={page.slug}>
            <Link
              href={href(locale, `/info/${page.slug}`)}
              aria-current={page.slug === current ? "page" : undefined}
              className={`text-base transition-colors hover:text-signal-text ${
                page.slug === current ? "font-medium text-bone" : "text-bone-dim"
              }`}
            >
              {page.title[locale]}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
