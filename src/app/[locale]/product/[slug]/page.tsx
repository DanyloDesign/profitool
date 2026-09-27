import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDict, isLocale, locales, type Dict, type Locale } from "@/i18n";
import { productBySlug, products } from "@/data/products";
import { brandBySlug, categoryBySlug, platformBySlug, specLabels } from "@/data/taxonomy";
import { localize, type Product } from "@/data/types";
import { categoryHref, countForPlatform, countIn, href, imageOf, keyValue, relatedTo } from "@/lib/shop";
import { revealSpecs, shortOf } from "@/lib/card";
import { BuyBox } from "@/components/product/buy-box";
import { ProductSections } from "@/components/product/product-sections";
import { StickyBuyBar } from "@/components/product/sticky-buy-bar";
import { ProductCard } from "@/components/catalog/product-card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { IconArrow, IconMapPin, IconShield, IconTruck } from "@/components/ui/icons";

type Params = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return locales.flatMap((locale) => products.map((product) => ({ locale, slug: product.slug })));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = productBySlug.get(slug);
  if (!product || !isLocale(locale)) return {};
  const brand = brandBySlug.get(product.brand);
  return {
    title: `${brand?.name} ${product.model} — Profitool`,
    description: product.description[locale],
  };
}

/** A value that fits one line of the figure cell in Unbounded. */
const FIGURE_MAX = 13;

/**
 * Four big figures for the buy column (015, research 17): the key spec, one more deciding spec,
 * what powers the tool (the battery platform, or the motor power for corded tools) and the
 * weight. Figures come only from the product's own specs.
 */
function figuresOf(product: Product, locale: Locale, dict: Dict): { label: string; value: string }[] {
  const keyLabel = specLabels[product.key.spec][locale];
  // "43 предмети · Предметів" says it twice; the bare number reads better above its label.
  const keyFigure =
    product.key.spec === "pieces" ? localize(product.key.value, locale) : keyValue(product, locale);
  const figures = [{ label: keyLabel, value: keyFigure }];

  const rest = revealSpecs(product, locale, product.specs.length);
  const fits = (value: string) => value.length <= FIGURE_MAX;
  const weight = rest.find((spec) => spec.key === "weight");
  const platform = product.platform ? platformBySlug.get(product.platform) : undefined;
  const voltage = product.specs.find(([key]) => key === "voltage");
  const source = platform
    ? {
        label: dict.pdp.figurePlatform(platform.name),
        value: voltage ? localize(voltage[1], locale) : `${platform.voltage} В`,
      }
    : rest.find((spec) => spec.key === "power");
  const other = rest.find(
    (spec) => spec.key !== "weight" && spec.key !== "power" && spec.key !== "rpm" && spec.key !== "bpm" && fits(spec.value),
  );

  for (const figure of [other, source]) if (figure) figures.push({ label: figure.label, value: figure.value });
  // Fill up with the next short specs, keeping the last place for the weight.
  const room = weight ? 3 : 4;
  for (const spec of rest) {
    if (figures.length >= room) break;
    if (spec !== weight && !figures.some((figure) => figure.label === spec.label) && fits(spec.value)) {
      figures.push({ label: spec.label, value: spec.value });
    }
  }
  if (weight) figures.push({ label: weight.label, value: weight.value });
  return figures.slice(0, 4);
}

export default async function ProductPage({ params }: Params) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const dict = getDict(locale);

  const product = productBySlug.get(slug);
  if (!product) notFound();

  const brand = brandBySlug.get(product.brand);
  const category = categoryBySlug.get(product.category);
  const figures = figuresOf(product, locale, dict);
  const related = relatedTo(product, 4);

  // The shelf is either the same section or, when the section has nothing else, the same platform.
  const shelfPlatform = product.platform ? platformBySlug.get(product.platform) : undefined;
  const shelf =
    related.length === 0
      ? null
      : related[0].category === product.category && category
        ? {
            title: dict.pdp.more(category.name[locale]),
            href: categoryHref(locale, category.slug),
            label: dict.product.allModels(countIn(category.slug)),
          }
        : shelfPlatform
          ? {
              title: dict.pdp.onPlatform(`${brandBySlug.get(shelfPlatform.brand)?.name ?? ""} ${shelfPlatform.name}`.trim()),
              href: `${href(locale, "/catalog")}?platform=${shelfPlatform.slug}`,
              label: dict.product.allModels(countForPlatform(shelfPlatform.slug)),
            }
          : null;

  const crumbs = [
    { label: dict.common.home, href: href(locale) },
    { label: dict.catalog.title, href: categoryHref(locale) },
    ...(category ? [{ label: category.name[locale], href: categoryHref(locale, category.slug) }] : []),
    { label: `${brand?.name} ${product.model}` },
  ];

  const terms = [
    { icon: <IconTruck className="h-5 w-5" />, text: dict.product.serviceDelivery },
    { icon: <IconMapPin className="h-5 w-5" />, text: dict.checkout.methodPickup, note: dict.common.footerHours },
    {
      icon: <IconShield className="h-5 w-5" />,
      text: `${dict.product.warranty} ${dict.product.warrantyValue(product.warranty)}, ${dict.product.serviceWarranty}`,
    },
    { icon: <ReturnIcon />, text: `${dict.product.returns} ${dict.product.returnsValue}` },
  ];

  return (
    <div className="shell pb-8 pt-7">
      <Breadcrumbs items={crumbs} label={dict.catalog.breadcrumbs} />

      {/* DOM order is the phone order: photo, the buy column, the details. On desktop the buy
          column stands to the right and spans both rows. */}
      <div className="mt-6 grid gap-x-16 gap-y-6 lg:mt-8 lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-y-0">
        <div className="pdp-photo lg:col-start-1 lg:row-start-1">
          <Image
            src={imageOf(product)}
            alt={`${brand?.name} ${product.model}`}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 800px"
            className="object-contain"
          />
        </div>

        <div className="pdp-buy lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
          <header>
            <p className="flex items-center gap-3">
              <Link
                href={`${href(locale, "/catalog")}?brand=${product.brand}`}
                className="text-base font-medium text-bone-dim transition-colors hover:text-signal-text"
              >
                {brand?.name}
              </Link>
              {product.badges.includes("new") ? (
                <span className="inline-flex h-7 items-center rounded-full border border-signal-text px-2.5 text-sm font-medium text-signal-text">
                  {dict.common.new}
                </span>
              ) : null}
            </p>
            <h1 className="t-h1 pdp-title mt-1.5 text-bone">{product.model}</h1>
            <p className="pdp-line mt-2.5 text-bone-dim">{shortOf(product, locale)}</p>
          </header>

          {figures.length >= 2 ? (
            <dl aria-label={dict.pdp.figures} data-count={figures.length} className="pdp-figures mt-5">
              {figures.map((figure) => (
                <div key={figure.label}>
                  <dt>{figure.label}</dt>
                  <dd>{figure.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          <div className="mt-6">
            <BuyBox product={product} />
          </div>

          <ul aria-label={dict.pdp.terms} className="mt-6 flex flex-col gap-3 border-t border-[var(--hair)] pt-5">
            {terms.map((term) => (
              <li key={term.text} className="pdp-line flex gap-3 text-bone">
                <span className="mt-px shrink-0 text-bone-dim">{term.icon}</span>
                <span>
                  {term.text}
                  {term.note ? <span className="block text-bone-dim">{term.note}</span> : null}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 lg:col-start-1 lg:row-start-2 lg:mt-10">
          <ProductSections product={product} />
        </div>
      </div>

      <StickyBuyBar product={product} />

      {shelf ? (
        <section aria-labelledby="pdp-more" className="mt-14 lg:mt-20">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
            <h2 id="pdp-more" className="t-h2 text-bone">
              {shelf.title}
            </h2>
            <Link href={shelf.href} className="ghost-btn btn-sm shrink-0">
              {shelf.label}
              <IconArrow className="h-4 w-4" />
            </Link>
          </div>
          <div className="pdp-shelf mt-7">
            {related.map((item) => (
              <ProductCard key={item.slug} product={item} size="rail" />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function ReturnIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 14 4 9l5-5" />
      <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
    </svg>
  );
}
