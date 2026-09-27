import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDict, isLocale, locales } from "@/i18n";
import { kitNoBattery, productBySlug, products } from "@/data/products";
import { brandBySlug, categoryBySlug } from "@/data/taxonomy";
import { categoryHref, countIn, href, imageOf, relatedTo } from "@/lib/shop";
import { BuyBox } from "@/components/product/buy-box";
import { ProductTabs } from "@/components/product/product-tabs";
import { StickyBuyBar } from "@/components/product/sticky-buy-bar";
import { ProductSection } from "@/components/catalog/product-section";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { IconAlert } from "@/components/ui/icons";

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

export default async function ProductPage({ params }: Params) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const dict = getDict(locale);

  const product = productBySlug.get(slug);
  if (!product) notFound();

  const brand = brandBySlug.get(product.brand);
  const category = categoryBySlug.get(product.category);
  const related = relatedTo(product, 4);
  const noBattery = product.kit.includes(kitNoBattery);

  const crumbs = [
    { label: dict.common.home, href: href(locale) },
    { label: dict.catalog.title, href: categoryHref(locale) },
    ...(category ? [{ label: category.name[locale], href: categoryHref(locale, category.slug) }] : []),
    { label: `${brand?.name} ${product.model}` },
  ];

  return (
    <div className="shell pb-8 pt-7">
      <Breadcrumbs items={crumbs} label={dict.catalog.breadcrumbs} />

      {/* На телефоне порядок: заголовок и фото, покупка, остальное. На десктопе покупка
          стоит второй колонкой и едет за прокруткой. */}
      <div className="mt-8 grid gap-x-16 gap-y-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-y-0">
        <div className="lg:col-start-1 lg:row-start-1">
          <header>
            <Link
              href={`${href(locale, "/catalog")}?brand=${product.brand}`}
              className="text-base text-bone-dim transition-colors hover:text-signal-text"
            >
              {brand?.name}
            </Link>
            <h1 className="t-h1 mt-1 text-bone">{product.model}</h1>
            <p className="mt-3 text-sm text-bone-dim">
              {dict.product.article} {product.sku}
            </p>
            <p className="mt-5 max-w-xl text-[19px] leading-normal text-bone-dim">{product.description[locale]}</p>
          </header>

          <div className="relative mt-6 h-[300px] sm:h-[420px] lg:h-[480px]">
            <Image
              src={imageOf(product)}
              alt={`${brand?.name} ${product.model}`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 800px"
              className="object-contain"
            />
          </div>
        </div>

        {/* Второй в DOM: на телефоне (нет lg:col-*) блоки идут потоком, поэтому покупка должна
            стоять сразу после фото, до характеристик — иначе кнопка «У кошик» уезжает вниз. */}
        <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:sticky lg:top-[calc(var(--header-h)+24px)] lg:self-start">
          <BuyBox product={product} />

          {/* Единственный заголовок в колонке — уровень не с чем рассогласовывать (раньше рядом
              был мелкий лейбл «Ключові характеристики», блок убран как дубль таблицы характеристик). */}
          <div className="mt-8 border-t border-[var(--hair)]">
            <h2 className="t-h3 mt-6 text-bone">{dict.product.conditions}</h2>
            <dl className="mt-2">
              <div className="spec-row">
                <dt className="leader text-[15px]">{dict.cart.delivery}</dt>
                <dd className="text-right text-[15px] text-bone">{dict.product.serviceDelivery}</dd>
              </div>
              <div className="spec-row">
                <dt className="leader text-[15px]">{dict.product.warranty}</dt>
                <dd className="text-right text-[15px] text-bone">
                  {dict.product.warrantyValue(product.warranty)}, {dict.product.serviceWarranty}
                </dd>
              </div>
              <div className="spec-row">
                <dt className="leader text-[15px]">{dict.product.returns}</dt>
                <dd className="text-right text-[15px] text-bone">{dict.product.returnsValue}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="lg:col-start-1 lg:row-start-2">
          {noBattery ? (
            <div
              role="note"
              className="flex items-start gap-3.5 rounded-[24px] border border-signal p-5"
            >
              <IconAlert className="mt-0.5 h-5 w-5 shrink-0 text-signal-text" />
              <div>
                <p className="text-base font-medium text-bone">{dict.product.noBatteryTitle}</p>
                <p className="mt-1 text-[15px] leading-normal text-bone-dim">{dict.product.noBatteryText}</p>
              </div>
            </div>
          ) : null}

          <div className="mt-14">
            <ProductTabs product={product} />
          </div>
        </div>
      </div>

      <StickyBuyBar product={product} />

      {related.length ? (
        <div className="mt-20">
          <ProductSection
            title={dict.product.related}
            items={related}
            size="rail"
            level="sub"
            action={
              category
                ? {
                    href: categoryHref(locale, category.slug),
                    label: dict.product.allModels(countIn(category.slug)),
                  }
                : undefined
            }
          />
        </div>
      ) : null}
    </div>
  );
}
