"use client";

import type { Locale } from "@/i18n";
import { useMounted } from "@/lib/use-mounted";
import { useI18n } from "@/i18n/context";
import { platforms } from "@/data/taxonomy";
import { products } from "@/data/products";
import { specFacets } from "@/lib/shop";
import { usePlatform } from "@/store/shop";
import { useCatalogQuery } from "./filters";

/**
 * Что из фильтров категории реально стоит показать быстрым чипом — чистая функция без хуков,
 * чтобы `ActiveFilters` могла спросить то же самое и не рисовать тот же фильтр второй раз
 * в ряду «Обрано» (один фильтр не должен стоять на экране трижды).
 */
export function computeQuickChips(category: string, locale: Locale, savedPlatform?: string) {
  const scope = products.filter((product) => product.category === category);
  const hasCorded = scope.some((product) => product.power === "corded");
  const hasCordless = scope.some((product) => product.power === "cordless");
  const facet = specFacets(scope, locale, category)[0];
  const topSpec = facet?.options[0];

  return {
    cordless: hasCorded && hasCordless,
    sale: scope.some((product) => product.oldPrice),
    inStock: scope.some((product) => product.stock === 0),
    platform: savedPlatform && scope.some((product) => product.platform === savedPlatform) ? savedPlatform : undefined,
    spec: facet && topSpec ? { key: facet.key, slug: topSpec.slug, label: topSpec.label } : undefined,
  };
}

/**
 * Быстрые фильтры-чипы над сеткой, в отличие от референса — реально переключают URL-фильтры.
 * Живут только на странице категории: на корне каталога уже есть чипы навигации по категориям,
 * рядом вторая строка чипов превращается в шум, который владелец явно не хочет видеть.
 */
export function QuickChips({ category }: { category: string }) {
  const { dict, locale } = useI18n();
  const { query, push } = useCatalogQuery();
  const mounted = useMounted();
  const savedPlatform = usePlatform((state) => state.slug);
  const quick = computeQuickChips(category, locale, mounted ? savedPlatform ?? undefined : undefined);

  const chips: { key: string; label: string; pressed: boolean; onClick: () => void }[] = [];

  if (quick.cordless) {
    chips.push({
      key: "power",
      label: dict.catalog.cordless,
      pressed: query.power === "cordless",
      onClick: () => push({ ...query, power: query.power === "cordless" ? undefined : "cordless" }),
    });
  }
  if (quick.sale) {
    chips.push({
      key: "sale",
      label: dict.catalog.onSaleOnly,
      pressed: query.onSale,
      onClick: () => push({ ...query, onSale: !query.onSale }),
    });
  }
  if (quick.inStock) {
    chips.push({
      key: "stock",
      label: dict.catalog.chipInStock,
      pressed: query.inStock,
      onClick: () => push({ ...query, inStock: !query.inStock }),
    });
  }
  if (quick.platform) {
    const platformSlug = quick.platform;
    const name = platforms.find((platform) => platform.slug === platformSlug)?.name;
    chips.push({
      key: "platform",
      label: name ? `${dict.catalog.chipMyPlatform} · ${name}` : dict.catalog.chipMyPlatform,
      pressed: query.platforms.includes(platformSlug),
      onClick: () => {
        const current = query.platforms;
        push({
          ...query,
          platforms: current.includes(platformSlug)
            ? current.filter((v) => v !== platformSlug)
            : [...current, platformSlug],
        });
      },
    });
  }
  if (quick.spec) {
    const { key: specKey, slug: specSlugValue, label } = quick.spec;
    chips.push({
      key: `spec-${specKey}`,
      label,
      pressed: (query.specs[specKey] ?? []).includes(specSlugValue),
      onClick: () => {
        const current = query.specs[specKey] ?? [];
        const next = current.includes(specSlugValue)
          ? current.filter((v) => v !== specSlugValue)
          : [...current, specSlugValue];
        const specs = { ...query.specs, [specKey]: next };
        if (next.length === 0) delete specs[specKey];
        push({ ...query, specs });
      },
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="-mx-[var(--gutter)] flex gap-2 overflow-x-auto px-[var(--gutter)] pb-1 scrollbar-none lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0 lg:pb-0">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          aria-pressed={chip.pressed}
          onClick={chip.onClick}
          className="chip shrink-0 focus-visible:relative focus-visible:z-10"
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}
