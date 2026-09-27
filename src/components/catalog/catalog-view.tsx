"use client";
import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getDict, type Locale } from "@/i18n";
import { categories, categoryBySlug } from "@/data/taxonomy";
import { applyQuery, categoryHref, href, parseQuery, queryToParams } from "@/lib/shop";
import { ProductCard } from "@/components/catalog/product-card";
import { ActiveFilters, Filters, FiltersTrigger, SortSelect } from "@/components/catalog/filters";
import { QuickChips } from "@/components/catalog/quick-chips";
import { LoadMore, Pagination } from "@/components/catalog/pagination";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";

/** 12 на странице для десктопной пагинации; на телефоне те же 12 добавляются по кнопке. */
const PAGE_SIZE = 12;

type ViewProps = { locale: Locale; categorySlug?: string };

/**
 * Каталог читает фильтры, сортировку и страницу из адресной строки в браузере, а не на сервере:
 * так страница собирается статически (GitHub Pages) и одинаково работает в dev.
 * До гидрации (и в статическом HTML) рисуется версия без параметров — полный список.
 */
export function CatalogView(props: ViewProps) {
  return (
    <Suspense fallback={<CatalogBody {...props} search={new URLSearchParams()} />}>
      <CatalogWithParams {...props} />
    </Suspense>
  );
}

function CatalogWithParams(props: ViewProps) {
  const params = useSearchParams();
  return <CatalogBody {...props} search={new URLSearchParams(params.toString())} />;
}

function CatalogBody({ locale, categorySlug, search }: ViewProps & { search: URLSearchParams }) {
  const dict = getDict(locale);
  const category = categorySlug ? categoryBySlug.get(categorySlug) : undefined;
  const query = parseQuery(search, categorySlug);
  const found = applyQuery(query);

  const rawPage = Number(search.get("page"));
  const totalPages = Math.max(1, Math.ceil(found.length / PAGE_SIZE));
  const page = Math.min(Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1, totalPages);
  const desktopStart = (page - 1) * PAGE_SIZE;
  const desktopEnd = page * PAGE_SIZE;
  const mobileEnd = Math.min(page * PAGE_SIZE, found.length);
  // Показываем один набор карточек: на десктопе прячем всё, что не входит в текущую страницу,
  // на телефоне видно всё до неё — так «Показати ще» дописывает, а не переоткрывает список.
  const visible = found.slice(0, mobileEnd);
  const basePath = categoryHref(locale, categorySlug);
  const buildPageHref = (target: number) => {
    const params = queryToParams(query);
    if (target > 1) params.set("page", String(target));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const crumbs = [
    { label: dict.common.home, href: href(locale) },
    { label: dict.catalog.title, href: category ? categoryHref(locale) : undefined },
    ...(category ? [{ label: category.name[locale] }] : []),
  ];

  return (
    <div className="shell pb-8 pt-7">
      <Breadcrumbs items={crumbs} label={dict.catalog.breadcrumbs} />

      <header className="mt-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div>
          <h1 className="t-h1 text-bone">{category ? category.name[locale] : dict.catalog.all}</h1>
          <p className="mt-3.5 text-[17px] text-bone-dim">
            {dict.catalog.models(found.length)}
            {category ? ` · ${category.blurb[locale]}` : ""}
          </p>
        </div>
        <div className="hidden lg:block">
          <Suspense fallback={null}>
            <SortSelect />
          </Suspense>
        </div>
      </header>

      {/*
        На телефоне сортировка и кнопка «Фільтри» раньше стояли отдельными полноширинными
        строками — вместе с чипами это съедало ~250px до первой карточки. Теперь один ряд
        из двух пилюль; сама панель фильтров (Filters) рядом ничего не рисует, пока закрыта.
      */}
      <div className="mt-4 flex gap-3 lg:hidden">
        <Suspense fallback={null}>
          <SortSelect className="flex-1" />
        </Suspense>
        <Suspense fallback={null}>
          <FiltersTrigger />
        </Suspense>
      </div>

      {!category ? (
        <div className="mt-4 flex flex-wrap gap-2 lg:mt-6">
          {categories.map((item) => (
            <Link key={item.slug} href={categoryHref(locale, item.slug)} className="chip !h-11 !px-5">
              {item.name[locale]}
            </Link>
          ))}
        </div>
      ) : (
        // Только на странице категории: на корне каталога уже есть чипы навигации по разделам,
        // вторая полоса чипов рядом превращается в шум.
        <div className="mt-4 lg:mt-6">
          <Suspense fallback={null}>
            <QuickChips category={category.slug} />
          </Suspense>
        </div>
      )}

      <div className="mt-4 grid gap-x-14 gap-y-6 lg:mt-9 lg:grid-cols-[264px_minmax(0,1fr)] lg:items-start">
        {/*
          На телефоне сама панель либо `hidden`, либо полноэкранный оверлей — своей строки в
          сетке ей не нужно, а `contents` убирает у aside собственный grid-item и лишний gap-y
          рядом с ним. На lg+ возвращаем обычный блок — там это настоящая колонка сайдбара.
        */}
        <aside aria-label={dict.catalog.filters} className="contents lg:block">
          <Suspense fallback={null}>
            <Filters total={found.length} category={categorySlug} />
          </Suspense>
        </aside>

        <div>
          <Suspense fallback={null}>
            <ActiveFilters category={categorySlug} />
          </Suspense>

          {found.length === 0 ? (
            <div className="border-t border-[var(--hair)] py-24 text-center">
              <p className="t-h2 text-bone">{dict.catalog.empty}</p>
              <p className="mt-4 text-bone-dim">{dict.catalog.emptyText}</p>
              <Link href={category ? categoryHref(locale, category.slug) : categoryHref(locale)} className="ghost-btn mt-8">
                {dict.catalog.resetAll}
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-10 md:gap-y-12 xl:grid-cols-3">
                {visible.map((product, index) => (
                  <ProductCard
                    key={product.slug}
                    product={product}
                    size="catalog"
                    priority={index < 3}
                    // На десктопе видна только текущая страница; телефон копит их сверху вниз без пагинации.
                    className={index >= desktopStart && index < desktopEnd ? "" : "lg:hidden"}
                  />
                ))}
              </div>

              {mobileEnd < found.length ? (
                <LoadMore
                  href={buildPageHref(page + 1)}
                  label={dict.catalog.showMore(Math.min(PAGE_SIZE, found.length - mobileEnd))}
                />
              ) : null}

              <Pagination
                page={page}
                totalPages={totalPages}
                buildHref={buildPageHref}
                prevLabel={dict.catalog.prevPage}
                nextLabel={dict.catalog.nextPage}
                navLabel={dict.catalog.pages}
                pageLabel={dict.catalog.page}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
