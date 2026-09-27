"use client";

import { useState, type ReactNode } from "react";
import { useI18n } from "@/i18n/context";
import { useMounted } from "@/lib/use-mounted";
import { brandBySlug, platformBySlug, specLabels } from "@/data/taxonomy";
import { kitKind, kitNoBattery } from "@/data/products";
import { localize, type Product } from "@/data/types";
import { usePlatform } from "@/store/shop";
import { IconCheck, IconChevron, IconClose } from "@/components/ui/icons";

type SectionId = "box" | "specs" | "description";

/**
 * The product details, stacked (015): "Що в коробці", "Характеристики", "Опис". No horizontal
 * tabs. From 1024px every section is open under its own heading. Below that each one is an
 * accordion with a 48px header, the first open, and a second tap closes it.
 * Both headings are in the DOM; CSS shows one per width, so the accessibility tree gets one.
 */
export function ProductSections({ product }: { product: Product }) {
  const { locale, dict } = useI18n();
  const [open, setOpen] = useState<Record<SectionId, boolean>>({ box: true, specs: false, description: false });

  const sections: { id: SectionId; title: string; body: ReactNode }[] = [
    { id: "box", title: dict.pdp.inBox, body: <BoxList product={product} /> },
    { id: "specs", title: dict.product.specs, body: <SpecList product={product} /> },
    {
      id: "description",
      title: dict.product.description,
      body: <p className="max-w-2xl leading-relaxed text-bone">{product.description[locale]}</p>,
    },
  ];

  return (
    <div className="border-t border-[var(--hair)] lg:border-t-0">
      {sections.map(({ id, title, body }) => {
        const expanded = open[id];
        return (
          <section
            key={id}
            className="border-b border-[var(--hair)] lg:border-b-0 lg:border-t lg:py-8"
          >
            <h2 className="t-h2 hidden text-bone lg:mb-5 lg:block">{title}</h2>
            <h2 className="lg:hidden">
              <button
                type="button"
                aria-expanded={expanded}
                aria-controls={`pdp-${id}`}
                onClick={() => setOpen((state) => ({ ...state, [id]: !state[id] }))}
                className="flex h-12 w-full items-center justify-between gap-4 text-left font-semibold text-bone"
              >
                {title}
                {/* IconChevron points right: a quarter turn gives down (closed) and up (open). */}
                <IconChevron
                  className={`h-4 w-4 shrink-0 text-bone-dim transition-transform ${expanded ? "-rotate-90" : "rotate-90"}`}
                />
              </button>
            </h2>
            <div id={`pdp-${id}`} className={expanded ? "pb-5 lg:pb-0" : "max-lg:hidden"}>
              {body}
            </div>
          </section>
        );
      })}
    </div>
  );
}

/**
 * Every item of the box with ✓, and for bare tools the battery and the charger with ✗ in place of
 * the combined "Без акумулятора і зарядного" (015). Kit items are compared by value: the product
 * comes from a server component as a copy, so a reference check (`item === kitNoBattery`) never
 * matched and the ✗ never showed.
 */
function BoxList({ product }: { product: Product }) {
  const { locale, dict } = useI18n();
  const mounted = useMounted();
  const myPlatform = usePlatform((state) => state.slug);

  const bare = kitKind(product) === "bare";
  const platform = product.platform ? platformBySlug.get(product.platform) : undefined;
  const platformName = platform ? `${brandBySlug.get(platform.brand)?.name ?? ""} ${platform.name}`.trim() : "";
  const fits = mounted && !!myPlatform && myPlatform === product.platform;

  const inside = [
    `${brandBySlug.get(product.brand)?.name ?? product.brand} ${product.model}`,
    ...product.kit.filter((item) => item.ua !== kitNoBattery.ua).map((item) => item[locale]),
  ];
  const missing = bare
    ? [
        {
          name: dict.pdp.boxBattery,
          note: platformName ? (fits ? dict.pdp.boxYours(platformName) : dict.pdp.boxNeeds(platformName)) : "",
          tone: fits ? "text-stock" : "text-signal-text",
        },
        { name: dict.pdp.boxCharger, note: "", tone: "" },
      ]
    : [];

  return (
    <ul className="sm:columns-2 sm:gap-x-12 lg:columns-1 xl:columns-2">
      {inside.map((name) => (
        <li key={name} className="flex min-h-12 break-inside-avoid items-center gap-3 border-b border-[var(--hair)] py-2.5 text-bone">
          <IconCheck className="h-5 w-5 shrink-0 text-stock" />
          {name}
        </li>
      ))}
      {missing.map((row) => (
        <li
          key={row.name}
          className="flex min-h-12 break-inside-avoid flex-wrap items-center gap-x-3 gap-y-0.5 border-b border-[var(--hair)] py-2.5"
        >
          <IconClose className="h-5 w-5 shrink-0 text-bone-faint" />
          <span className="text-bone-dim">
            {row.name}
            <span className="sr-only">, {dict.pdp.boxMissing}</span>
          </span>
          {row.note ? <span className={`pdp-line ${row.tone}`}>{row.note}</span> : null}
        </li>
      ))}
    </ul>
  );
}

/** All specs, then the SKU (moved out of the page header) and the warranty. */
function SpecList({ product }: { product: Product }) {
  const { locale, dict } = useI18n();
  const rows = [
    ...product.specs.map(([key, value]) => [specLabels[key][locale], localize(value, locale)] as const),
    [dict.product.article, product.sku] as const,
    [dict.product.warranty, `${dict.product.warrantyValue(product.warranty)}, ${dict.product.serviceWarranty}`] as const,
  ];

  return (
    <dl className="grid gap-x-12 md:grid-cols-2 lg:grid-cols-1">
      {rows.map(([label, value]) => (
        <div key={label} className="spec-row !py-3.5">
          <dt className="leader">{label}</dt>
          <dd className="text-right text-bone">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
