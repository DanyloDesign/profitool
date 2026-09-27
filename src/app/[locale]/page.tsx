import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDict, isLocale, type Locale } from "@/i18n";
import { categories, categoryBySlug, brandBySlug } from "@/data/taxonomy";
import { productBySlug, products } from "@/data/products";
import type { Product } from "@/data/types";
import {
  bestsellers,
  categoryHref,
  categoryIcon,
  discounted,
  freshArrivals,
  href,
  imageOf,
  price,
  productHref,
} from "@/lib/shop";
import { ProductSection } from "@/components/catalog/product-section";
import { PlatformPicker } from "@/components/catalog/platform-picker";
import { IconArrow } from "@/components/ui/icons";

type Dict = ReturnType<typeof getDict>;
type Ctx = { locale: Locale; dict: Dict };

const HERO_SLUG = "milwaukee-m18-chx";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const dict = getDict(locale);

  // Один товар не показываем в двух блоках подряд.
  const used = new Set<string>([HERO_SLUG]);
  const take = (list: Product[]) => {
    const picked = list.filter((product) => !used.has(product.slug)).slice(0, 4);
    picked.forEach((product) => used.add(product.slug));
    return picked;
  };
  const sale = take(discounted(20));
  const popular = take(bestsellers(30));
  const fresh = take(freshArrivals(30));
  const saleCount = products.filter((product) => product.oldPrice).length;

  return (
    <>
      <Hero locale={locale} dict={dict} />

      <div className="shell space-y-16 pt-14 md:space-y-20 md:pt-16">
        <Categories locale={locale} dict={dict} />

        <ProductSection
          title={dict.home.sale}
          note={dict.home.saleNote}
          items={sale}
          action={{ href: `${href(locale, "/catalog")}?sale=1`, label: dict.home.saleAll(saleCount), outline: true }}
        />

        <ProductSection
          title={dict.home.bestsellers}
          items={popular}
          action={{ href: href(locale, "/catalog"), label: dict.home.viewAll }}
        />

        <ProductSection
          title={dict.home.fresh}
          items={fresh}
          action={{ href: `${href(locale, "/catalog")}?sort=new`, label: dict.home.viewAll }}
        />

        <PlatformPicker />
      </div>
    </>
  );
}

function Hero({ locale, dict }: Ctx) {
  const product = productBySlug.get(HERO_SLUG)!;
  const brand = brandBySlug.get(product.brand)?.name ?? product.brand;
  const category = categoryBySlug.get(product.category);

  return (
    <section className="border-b border-[var(--hair)]">
      <div className="shell grid gap-x-8 pb-12 pt-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:grid-rows-[auto_1fr] lg:pb-0 lg:pt-20">
        <div className="lg:col-start-1 lg:row-start-1">
          <p className="text-sm font-medium text-signal-text">{dict.home.hitOfWeek}</p>
          <h1 className="t-hero mt-4 text-bone">
            {brand}
            <br />
            {product.model}
          </h1>
        </div>

        <div className="relative order-2 my-2 h-[280px] sm:h-[380px] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:my-0 lg:h-[560px]">
          <Image
            src={imageOf(product)}
            alt={`${brand} ${product.model}`}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 720px"
            className="object-contain"
          />
        </div>

        <div className="order-3 lg:col-start-1 lg:row-start-2 lg:pb-20">
          <p className="max-w-[430px] text-[19px] leading-normal text-bone-dim">{product.description[locale]}</p>

          <div className="mt-7 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className="t-price text-4xl text-bone lg:text-[44px]">{price(product.price)} ₴</span>
            <span className="text-base text-bone-dim">{dict.stock.inCity(product.stock)}</span>
          </div>

          <div className="mt-7 flex flex-wrap gap-3.5">
            <Link href={productHref(locale, product.slug)} className="signal-btn btn-lg w-full sm:w-auto">
              {dict.home.buy}
            </Link>
            {category ? (
              <Link href={categoryHref(locale, category.slug)} className="ghost-btn btn-lg w-full sm:w-auto sm:!px-8">
                {dict.home.allOf(category.name[locale])}
                <IconArrow className="h-[18px] w-[18px]" />
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function Categories({ locale, dict }: Ctx) {
  const inStock = products.filter((product) => product.stock > 0).length;

  return (
    <section>
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="t-eyebrow text-bone-dim">{dict.home.categories}</h2>
        <Link
          href={href(locale, "/catalog")}
          className="text-[15px] text-bone-dim transition-colors hover:text-signal-text"
        >
          {dict.home.inStock(inStock)}
        </Link>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-x-10 border-b border-[var(--hair)] sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={categoryHref(locale, category.slug)}
            className="group flex items-center gap-4 border-t border-[var(--hair)] py-4 lg:gap-[18px] lg:py-5"
          >
            <span className="relative h-16 w-16 shrink-0 lg:h-[88px] lg:w-[88px]">
              <Image
                src={categoryIcon(category.slug)}
                alt=""
                fill
                sizes="88px"
                className="object-contain transition-transform duration-500 group-hover:scale-105"
              />
            </span>
            <span className="min-w-0">
              <span className="block text-[19px] font-medium leading-snug text-bone transition-colors group-hover:text-signal-text">
                {category.name[locale]}
              </span>
              <span className="mt-1 block text-sm text-bone-dim">{category.blurb[locale]}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
