import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDict, isLocale, type Locale } from "@/i18n";
import { categories, categoryBySlug, brandBySlug } from "@/data/taxonomy";
import { kitKind, productBySlug, products } from "@/data/products";
import type { Product } from "@/data/types";
import {
  bestsellers,
  categoryHref,
  categoryPhoto,
  discounted,
  freshArrivals,
  href,
  imageOf,
  price,
  productHref,
} from "@/lib/shop";
import { ProductSection, SectionAction } from "@/components/catalog/product-section";
import { PlatformPicker } from "@/components/catalog/platform-picker";
import { HeroKitLine } from "@/components/home/hero-kit-line";
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

      {/* 015: "Мої батареї" right under the hero, one row between two hairlines. */}
      <div className="shell">
        <PlatformPicker />
      </div>

      <div className="shell space-y-16 pt-12 md:space-y-20 md:pt-14">
        <Categories locale={locale} dict={dict} />

        <ProductSection
          title={dict.home.sale}
          note={dict.home.saleNote}
          items={sale}
          action={{ href: `${href(locale, "/catalog")}?sale=1`, label: dict.home.saleAll(saleCount) }}
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
      </div>
    </>
  );
}

function Hero({ locale, dict }: Ctx) {
  const product = productBySlug.get(HERO_SLUG)!;
  const brand = brandBySlug.get(product.brand)?.name ?? product.brand;
  const category = categoryBySlug.get(product.category);

  return (
    <section>
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
          {kitKind(product) === "bare" && product.platform ? <HeroKitLine platform={product.platform} /> : null}

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

/**
 * Where long section names break on a narrow tile, as on the canvas. A soft hyphen takes priority
 * over the browser's own points, which would split "Вимірюва-ння" or leave "-ни" on a line.
 */
const SHY = "\u00ad";
const TILE_BREAKS: Record<string, string> = {
  Перфоратори: `Перфо${SHY}ратори`,
  Перфораторы: `Перфо${SHY}раторы`,
  Шурупокрути: `Шурупо${SHY}крути`,
  Шуруповёрты: `Шурупо${SHY}вёрты`,
  Шліфмашини: `Шліф${SHY}машини`,
  шліфмашини: `шліф${SHY}машини`,
  Шлифмашины: `Шлиф${SHY}машины`,
  шлифмашины: `шлиф${SHY}машины`,
  Вимірювання: `Вимірю${SHY}вання`,
};
const tileName = (name: string) =>
  name
    .split(" ")
    .map((word) => TILE_BREAKS[word] ?? word)
    .join(" ");

/**
 * 015: section tiles with a real product photo each (categoryPhoto). Eight in one row from 1024px,
 * a 4×2 grid below. The whole tile is the link; hover gives it the surface.
 */
function Categories({ locale, dict }: Ctx) {
  return (
    <section>
      <div className="flex items-end justify-between gap-6">
        <h2 className="t-section text-bone">{dict.home.categories}</h2>
        <SectionAction action={{ href: href(locale, "/catalog"), label: dict.home.allProducts(products.length) }} placement="head" />
      </div>

      {/* Phones: two columns of "photo + name" rows, so every name fits whole without hyphens.
          From 768px: photo tiles, 4 then 8 in a row. */}
      <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-1 md:mt-7 md:grid-cols-4 md:gap-y-4 lg:grid-cols-8">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={categoryHref(locale, category.slug)}
            className="flex min-h-14 items-center gap-2.5 rounded-[18px] px-1.5 py-1.5 text-left transition-colors duration-[var(--dur-fast)] hover:bg-ink-800 md:flex-col md:px-1.5 md:pb-4 md:pt-3.5 md:text-center"
          >
            <span className="relative block aspect-square w-11 shrink-0 md:w-24 lg:w-full lg:max-w-[120px]">
              <Image
                src={categoryPhoto(category.slug)}
                alt=""
                fill
                sizes="(min-width: 1024px) 120px, (min-width: 768px) 96px, 44px"
                className="object-contain"
              />
            </span>
            {/* In the 8-column row at 1024–1279px long compound names ("шліфмашини") are wider than
                a tile: break them at TILE_BREAKS and never leave a two-letter tail. Elsewhere whole
                words fit, so hyphens stay off and names break at the space. */}
            <span className="line-clamp-3 min-w-0 text-[15px] font-medium leading-snug text-bone hyphens-none md:text-base lg:hyphens-auto lg:[hyphenate-limit-chars:6_3_3] xl:hyphens-none">
              {tileName(category.name[locale])}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
