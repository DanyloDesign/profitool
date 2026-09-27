"use client";

import Image from "next/image";
import { useMounted } from "@/lib/use-mounted";
import Link from "next/link";
import { useState } from "react";
import { useI18n } from "@/i18n/context";
import { productBySlug } from "@/data/products";
import { brandBySlug, categoryBySlug, specLabels } from "@/data/taxonomy";
import { localize, type Product, type SpecKey } from "@/data/types";
import { categoryHref, href, imageOf, price, productHref } from "@/lib/shop";
import { useCart, useCompare } from "@/store/shop";
import { EmptyState } from "@/components/ui/empty-state";
import { IconCheck, IconClose, IconCompare } from "@/components/ui/icons";

export function CompareTable() {
  const { locale, dict } = useI18n();
  const mounted = useMounted();
  const [onlyDiff, setOnlyDiff] = useState(false);
  const slugs = useCompare((state) => state.slugs);
  const toggle = useCompare((state) => state.toggle);
  const clear = useCompare((state) => state.clear);
  const add = useCart((state) => state.add);
  // Селектор обязан возвращать стабильную ссылку: .map() создаёт новый массив
  // на каждый рендер и уводит подписку в бесконечный цикл.
  const cartItems = useCart((state) => state.items);

  if (!mounted) return <div className="min-h-[40vh]" role="status" aria-busy="true" />;

  const items = slugs.map((slug) => productBySlug.get(slug)).filter((p): p is Product => p !== undefined);

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<IconCompare className="h-12 w-12" strokeWidth={1.2} />}
        title={dict.compare.empty}
        text={dict.compare.emptyText}
        cta={{ href: href(locale, "/catalog"), label: dict.catalog.all }}
      />
    );
  }

  // Порядок строк задаёт первый товар, остальные ключи дописываются следом.
  const keys: SpecKey[] = [];
  for (const product of items) {
    for (const [key] of product.specs) {
      if (!keys.includes(key)) keys.push(key);
    }
  }

  const rows = [
    ...keys.map((key) => ({
      key,
      label: specLabels[key][locale],
      values: items.map((product) => {
        const spec = product.specs.find(([specKey]) => specKey === key);
        return spec ? localize(spec[1], locale) : null;
      }),
    })),
    {
      key: "warranty",
      label: dict.product.warranty,
      values: items.map((product) => dict.product.warrantyValue(product.warranty)),
    },
  ].map((row) => ({ ...row, differs: new Set(row.values).size > 1 }));

  const shown = onlyDiff ? rows.filter((row) => row.differs) : rows;
  const firstCategory = categoryBySlug.get(items[0].category);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <span className="text-[17px] text-bone-dim">
          {firstCategory && items.every((item) => item.category === firstCategory.slug)
            ? `${firstCategory.name[locale]}, `
            : ""}
          {dict.compare.count(items.length)}
        </span>
        <label className="flex min-h-11 items-center gap-3 text-base text-bone-dim">
          <input
            type="checkbox"
            checked={onlyDiff}
            onChange={(event) => setOnlyDiff(event.target.checked)}
            className="check"
          />
          {dict.compare.onlyDiff}
        </label>
        <button type="button" onClick={clear} className="ghost-btn btn-sm sm:ml-auto">
          {dict.compare.clear}
        </button>
      </div>

      <div className="-mx-[var(--gutter)] mt-6 overflow-x-auto px-[var(--gutter)]">
        <table className="w-full min-w-[760px] table-fixed border-collapse">
          <caption className="sr-only">{dict.compare.title}</caption>
          <thead>
            <tr>
              <td className="w-[150px] lg:w-[220px]" />
              {items.map((product) => {
                const brand = brandBySlug.get(product.brand)?.name ?? product.brand;
                const inCart = cartItems.some((item) => item.slug === product.slug);
                const out = product.stock === 0;
                return (
                  <th key={product.slug} scope="col" className="px-4 pb-6 text-left align-top font-normal">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => toggle(product.slug)}
                        aria-label={dict.product.compareRemove(`${brand} ${product.model}`)}
                        className="icon-btn -mr-2"
                      >
                        <IconClose className="h-[18px] w-[18px]" />
                      </button>
                    </div>
                    <Link href={productHref(locale, product.slug)} className="group block">
                      <span className="relative block h-[180px]">
                        <Image
                          src={imageOf(product)}
                          alt={`${brand} ${product.model}`}
                          fill
                          sizes="260px"
                          className="object-contain transition-transform duration-500 group-hover:scale-105"
                        />
                      </span>
                      <span className="mt-3 block text-sm text-bone-dim">{brand}</span>
                      <span className="mt-1 block text-[19px] font-medium leading-snug text-bone">
                        {product.model}
                      </span>
                    </Link>
                    <p className="t-price mt-2.5 text-2xl">{price(product.price)} ₴</p>
                    <button
                      type="button"
                      onClick={() => add(product.slug)}
                      disabled={out}
                      className="signal-btn btn-sm mt-4 w-full"
                    >
                      {inCart ? <IconCheck className="h-[18px] w-[18px]" /> : null}
                      {out ? dict.stock.out : inCart ? dict.product.inCart : dict.product.addToCart}
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {shown.map((row) => (
              <tr key={row.key}>
                <th
                  scope="row"
                  className="sticky left-0 z-10 border-t border-[var(--hair)] bg-ink-900 py-4 pr-4 text-left text-base font-normal text-bone-dim"
                >
                  {row.label}
                </th>
                {row.values.map((value, index) => (
                  <td
                    key={items[index].slug}
                    className={`border-t border-[var(--hair)] px-4 py-4 text-base ${
                      row.differs ? "text-bone" : "text-bone-dim"
                    }`}
                  >
                    {value ?? "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8">
        <Link
          href={firstCategory ? categoryHref(locale, firstCategory.slug) : href(locale, "/catalog")}
          className="ghost-btn"
        >
          {dict.compare.add}
          {firstCategory ? ` ${firstCategory.name[locale].toLowerCase()}` : ""}
        </Link>
      </div>
    </div>
  );
}
