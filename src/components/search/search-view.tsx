"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getDict, type Locale } from "@/i18n";
import { applyQuery, emptyQuery, href } from "@/lib/shop";
import { ProductCard } from "@/components/catalog/product-card";
import { EmptyState } from "@/components/ui/empty-state";
import { IconSearch } from "@/components/ui/icons";

/**
 * Запрос ?q= читается в браузере, как и фильтры каталога: страница собирается статически.
 * До гидрации рисуется пустой поиск с подсказкой.
 *
 * 015: the page has no field of its own. The header field shows the query (HeaderSearch reads
 * `?q=` on /search) and answers with the same suggestions panel on every width.
 */
export function SearchView({ locale }: { locale: Locale }) {
  return (
    <Suspense fallback={<SearchBody locale={locale} query="" />}>
      <SearchWithParams locale={locale} />
    </Suspense>
  );
}

function SearchWithParams({ locale }: { locale: Locale }) {
  const query = useSearchParams().get("q")?.trim() ?? "";
  return <SearchBody locale={locale} query={query} />;
}

function SearchBody({ locale, query }: { locale: Locale; query: string }) {
  const dict = getDict(locale);
  const found = query ? applyQuery({ ...emptyQuery(), search: query }) : [];

  return (
    <div className="shell pb-8 pt-10">
      <h1 className="t-h1 text-bone">{dict.search.title}</h1>

      <p className="mt-6 text-[17px] text-bone-dim">
        {query ? dict.search.results(found.length, query) : dict.search.hint}
      </p>

      {query && found.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={<IconSearch className="h-12 w-12" strokeWidth={1.2} />}
            title={dict.search.empty(query)}
            text={dict.search.emptyText}
            cta={{ href: href(locale, "/catalog"), label: dict.catalog.all }}
          />
        </div>
      ) : null}

      {found.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-10 md:gap-y-12 lg:grid-cols-4">
          {found.map((product, index) => (
            <ProductCard key={product.slug} product={product} size="home" priority={index < 4} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
