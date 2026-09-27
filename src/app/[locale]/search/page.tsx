import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getDict, isLocale } from "@/i18n";
import { applyQuery, emptyQuery, href } from "@/lib/shop";
import { ProductCard } from "@/components/catalog/product-card";
import { SearchBox } from "@/components/layout/header";
import { EmptyState } from "@/components/ui/empty-state";
import { IconSearch } from "@/components/ui/icons";

type Params = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ params, searchParams }: Params) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDict(locale);
  const query = (await searchParams).q?.trim() ?? "";

  const found = query ? applyQuery({ ...emptyQuery(), search: query }) : [];

  return (
    <div className="shell pb-8 pt-10">
      <h1 className="t-h1 text-bone">{dict.search.title}</h1>

      {/* На телефоне поле в шапке не помещается, поэтому поиск живёт здесь. */}
      <Suspense fallback={null}>
        <SearchBox key={query} className="relative mt-6 max-w-2xl md:hidden" defaultValue={query} autoFocus={!query} />
      </Suspense>

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
