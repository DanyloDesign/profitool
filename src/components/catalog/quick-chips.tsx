"use client";

import { useEffect, useRef } from "react";
import type { Locale } from "@/i18n";
import { useI18n } from "@/i18n/context";
import { products } from "@/data/products";
import { applyQuery, specFacets, type CatalogQuery } from "@/lib/shop";
import { IconCheck } from "@/components/ui/icons";
import { useCatalogQuery } from "./filters";

/** 015: the section that gets "Під яку роботу" pills. Impact energy decides the job there. */
export const TASK_CATEGORY = "rotary-hammers";

type Task = NonNullable<CatalogQuery["task"]>;
const TASKS: Task[] = ["home", "daily", "heavy"];

/**
 * Что из фильтров категории реально стоит показать быстрым чипом — чистая функция без хуков,
 * чтобы `ActiveFilters` могла спросить то же самое и не рисовать тот же фильтр второй раз
 * в ряду выбранных (один фильтр не должен стоять на экране трижды).
 * The remembered battery platform is no longer a quick chip: ActiveFilters offers it as a dashed
 * suggestion (015), so it shows once.
 */
export function computeQuickChips(category: string, locale: Locale) {
  const scope = products.filter((product) => product.category === category);
  const hasCorded = scope.some((product) => product.power === "corded");
  const hasCordless = scope.some((product) => product.power === "cordless");
  // On rotary hammers the task pills already cover impact energy.
  const facet = specFacets(scope, locale, category).find(
    (candidate) => !(category === TASK_CATEGORY && candidate.key === "impact"),
  );
  const topSpec = facet?.options[0];

  return {
    cordless: hasCorded && hasCordless,
    sale: scope.some((product) => product.oldPrice),
    inStock: scope.some((product) => product.stock === 0),
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
  const quick = computeQuickChips(category, locale);

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
          className="chip !h-11 shrink-0 focus-visible:relative focus-visible:z-10"
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}

/**
 * "Під яку роботу" (015, research 20): three pills that pick rotary hammers by the job, mapped to
 * impact energy. One task at a time; a second tap clears it. A pill that would give 0 products
 * with the other filters as they are is disabled. Lives in the URL as `?task=`.
 */
export function TaskChips({ category }: { category: string }) {
  const { dict } = useI18n();
  const { query, push } = useCatalogQuery();
  const row = useRef<HTMLDivElement>(null);

  // On phones the row swipes: bring the chosen pill into view when the page opens with ?task=.
  // Only the row scrolls, never the page.
  useEffect(() => {
    const node = row.current;
    const pressed = node?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!node || !pressed || node.scrollWidth <= node.clientWidth) return;
    const overflow = pressed.offsetLeft + pressed.offsetWidth - (node.scrollLeft + node.clientWidth);
    if (overflow > 0) node.scrollLeft += overflow + 16;
  }, [query.task]);

  if (category !== TASK_CATEGORY) return null;

  const copy: Record<Task, { title: string; range: string }> = {
    home: { title: dict.listing.taskHome, range: dict.listing.taskHomeRange },
    daily: { title: dict.listing.taskDaily, range: dict.listing.taskDailyRange },
    heavy: { title: dict.listing.taskHeavy, range: dict.listing.taskHeavyRange },
  };

  return (
    <div role="group" aria-labelledby="listing-tasks" className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:gap-4">
      <span id="listing-tasks" className="text-[15px] text-bone-dim">
        {dict.listing.tasksTitle}
      </span>
      <div
        ref={row}
        className="relative -mx-[var(--gutter)] flex gap-2.5 overflow-x-auto px-[var(--gutter)] pb-1 scrollbar-none lg:mx-0 lg:overflow-visible lg:px-0 lg:pb-0"
      >
        {TASKS.map((task) => {
          const on = query.task === task;
          const disabled = !on && applyQuery({ ...query, category, task }).length === 0;
          return (
            <button
              key={task}
              type="button"
              aria-pressed={on}
              disabled={disabled}
              onClick={() => push({ ...query, task: on ? undefined : task })}
              className="listing-task focus-visible:relative focus-visible:z-10"
            >
              {on ? <IconCheck className="h-4 w-4 shrink-0 text-signal-text" strokeWidth={2.2} /> : null}
              <span className="flex flex-col">
                <span className="listing-task-title">{copy[task].title}</span>
                <span className="listing-task-range">{copy[task].range}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
