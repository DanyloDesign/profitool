"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMounted } from "@/lib/use-mounted";
import { useEffect, useRef, useState } from "react";
import { create } from "zustand";
import { useI18n } from "@/i18n/context";
import { brands, platforms, specLabels } from "@/data/taxonomy";
import { products } from "@/data/products";
import { parseQuery, queryToParams, specFacets, type CatalogQuery, type SpecFacet } from "@/lib/shop";
import { usePlatform } from "@/store/shop";
import { IconBattery, IconClose, IconFilter } from "@/components/ui/icons";
import { computeQuickChips } from "./quick-chips";

/** Фильтры пишут в адресную строку: ссылку можно переслать, «назад» работает. */
export function useCatalogQuery() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const query = parseQuery(new URLSearchParams(params.toString()));

  const push = (next: CatalogQuery) => {
    const search = queryToParams(next).toString();
    router.push(search ? `${pathname}?${search}` : pathname, { scroll: false });
  };

  return { query, push };
}

const cleared: Partial<CatalogQuery> = {
  brands: [],
  platforms: [],
  inStock: false,
  onSale: false,
  power: undefined,
  min: undefined,
  max: undefined,
  specs: {},
};

export function activeFilterCount(query: CatalogQuery): number {
  return (
    query.brands.length +
    query.platforms.length +
    (query.inStock ? 1 : 0) +
    (query.onSale ? 1 : 0) +
    (query.power ? 1 : 0) +
    (query.min || query.max ? 1 : 0) +
    Object.values(query.specs).reduce((sum, values) => sum + values.length, 0)
  );
}

/**
 * Кнопка «Фільтри · N» на телефоне живёт в отдельной пилюле рядом с сортировкой (см. FiltersTrigger),
 * а сама панель — здесь же, в Filters. Общее состояние открытости — через стор, а не проп: компоненты
 * стоят в разных местах разметки и не могут передать его друг другу иначе.
 */
const useFiltersOpen = create<{ open: boolean; setOpen: (open: boolean) => void }>()((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));

/** Фокус после закрытия ящика должен вернуться на кнопку — она смонтирована отдельно, поэтому ссылка модульная. */
const triggerNode: { current: HTMLButtonElement | null } = { current: null };

export function Filters({ total, category }: { total: number; category?: string }) {
  const { dict, locale } = useI18n();
  const { query, push } = useCatalogQuery();
  const open = useFiltersOpen((state) => state.open);
  const setOpen = useFiltersOpen((state) => state.setOpen);
  const dialog = useRef<HTMLDivElement>(null);
  const savedPlatform = usePlatform((state) => state.slug);

  const scope = products.filter((product) => !category || product.category === category);
  const brandRows = brands
    .map((brand) => ({ ...brand, count: scope.filter((p) => p.brand === brand.slug).length }))
    .filter((row) => row.count > 0);
  const platformRows = platforms
    .map((platform) => ({ ...platform, count: scope.filter((p) => p.platform === platform.slug).length }))
    .filter((row) => row.count > 0);
  const powerRows = (["cordless", "corded"] as const)
    .map((power) => ({ power, count: scope.filter((p) => p.power === power).length }))
    .filter((row) => row.count > 0);
  // Только там, где у категории реально ≥2 разных значения — иначе фильтр не отсеивает.
  const specGroups = category ? specFacets(scope, locale, category) : [];

  const toggleIn = (key: "brands" | "platforms", value: string) => {
    const current = query[key];
    push({
      ...query,
      [key]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
    });
  };

  const toggleSpec = (key: string, slug: string) => {
    const current = query.specs[key] ?? [];
    const next = current.includes(slug) ? current.filter((v) => v !== slug) : [...current, slug];
    const specs = { ...query.specs, [key]: next };
    if (next.length === 0) delete specs[key];
    push({ ...query, specs });
  };

  const active = activeFilterCount(query);

  // Мобильный ящик ведёт себя как модалка: Escape закрывает, Tab не уходит за край, фокус возвращается.
  useEffect(() => {
    if (!open) return;
    const node = dialog.current;
    document.body.style.overflow = "hidden";
    node?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "Tab" || !node) return;
      const items = node.querySelectorAll<HTMLElement>("button, input, a[href], select");
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      triggerNode.current?.focus();
    };
  }, [open, setOpen]);

  return (
    <div
      ref={dialog}
      tabIndex={-1}
      role={open ? "dialog" : undefined}
      aria-modal={open ? true : undefined}
      aria-label={dict.catalog.filters}
      className={`outline-none ${open ? "fixed inset-0 z-[60] flex flex-col bg-ink-900" : "hidden lg:block"}`}
    >
      <div className={open ? "flex-1 overflow-y-auto px-[var(--gutter)] pb-6" : ""}>
        <div className="flex items-center justify-between border-b border-[var(--hair)] pb-3.5 pt-1 lg:pt-0">
          <span className="t-eyebrow text-bone-dim">{dict.catalog.filters}</span>
          <div className="flex items-center gap-3">
            {/* На телефоне «Скинути» уже есть в подвале ящика — здесь второй раз не нужен. */}
            {active > 0 && !open ? (
              <button
                type="button"
                onClick={() => push({ ...query, ...cleared })}
                className="text-sm text-signal-text hover:underline"
              >
                {dict.catalog.reset}
              </button>
              ) : null}
              {open ? (
                <button type="button" onClick={() => setOpen(false)} aria-label={dict.nav.close} className="icon-btn !text-bone">
                  <IconClose className="h-6 w-6" />
                </button>
              ) : null}
            </div>
          </div>

          {savedPlatform && platformRows.some((row) => row.slug === savedPlatform) ? (
            <SavedPlatform
              slug={savedPlatform}
              applied={query.platforms.includes(savedPlatform)}
              onToggle={() => toggleIn("platforms", savedPlatform)}
              label={dict.nav.myBattery}
            />
          ) : null}

          {powerRows.length > 1 ? (
            <Group title={dict.catalog.power}>
              {powerRows.map(({ power, count }) => (
                <Check
                  key={power}
                  checked={query.power === power}
                  onChange={() => push({ ...query, power: query.power === power ? undefined : power })}
                  label={power === "corded" ? dict.catalog.corded : dict.catalog.cordless}
                  count={count}
                />
              ))}
            </Group>
          ) : null}

          {brandRows.length > 1 ? (
            <Group title={dict.catalog.brand}>
              {brandRows.map((brand) => (
                <Check
                  key={brand.slug}
                  checked={query.brands.includes(brand.slug)}
                  onChange={() => toggleIn("brands", brand.slug)}
                  label={brand.name}
                  count={brand.count}
                />
              ))}
            </Group>
          ) : null}

          <Group title={dict.catalog.price}>
            {/* key: при сбросе фильтров поля заполняются заново из адреса */}
            <PriceRange key={`${query.min ?? ""}-${query.max ?? ""}`} query={query} onChange={push} />
          </Group>

          {platformRows.length > 0 ? (
            <Group title={dict.catalog.platform}>
              <div className="flex flex-wrap gap-2 pb-3">
                {platformRows.map((platform) => (
                  <button
                    key={platform.slug}
                    type="button"
                    aria-pressed={query.platforms.includes(platform.slug)}
                    onClick={() => toggleIn("platforms", platform.slug)}
                    className="chip"
                  >
                    {platform.name}
                  </button>
                ))}
              </div>
            </Group>
          ) : null}

          {specGroups.map((facet) => (
            <SpecGroup
              key={facet.key}
              title={specLabels[facet.key][locale]}
              facet={facet}
              selected={query.specs[facet.key] ?? []}
              onToggle={(slug) => toggleSpec(facet.key, slug)}
              moreLabel={dict.catalog.specMore}
            />
          ))}

          <Group title={dict.catalog.availability} last>
            <Check
              checked={query.inStock}
              onChange={() => push({ ...query, inStock: !query.inStock })}
              label={dict.catalog.inStockOnly}
            />
            <Check
              checked={query.onSale}
              onChange={() => push({ ...query, onSale: !query.onSale })}
              label={dict.catalog.onSaleOnly}
            />
          </Group>
        </div>

        {open ? (
          <div className="flex items-center gap-3 border-t border-[var(--hair)] p-[var(--gutter)]">
            {active > 0 ? (
              <button type="button" onClick={() => push({ ...query, ...cleared })} className="ghost-btn shrink-0">
                {dict.catalog.reset}
              </button>
            ) : null}
            <button type="button" onClick={() => setOpen(false)} className="signal-btn w-full">
              {dict.catalog.showResultsItems(total)}
            </button>
          </div>
        ) : null}
      </div>
  );
}

/**
 * Кнопка «Фільтри · N», отдельно от панели: на телефоне она стоит в одном ряду с сортировкой,
 * а не там, где физически лежит `<aside>` с самой панелью.
 */
export function FiltersTrigger() {
  const { dict } = useI18n();
  const { query } = useCatalogQuery();
  const setOpen = useFiltersOpen((state) => state.setOpen);
  const active = activeFilterCount(query);

  return (
    <button
      ref={(node) => {
        triggerNode.current = node;
      }}
      type="button"
      onClick={() => setOpen(true)}
      aria-haspopup="dialog"
      className="ghost-btn btn-sm flex-1"
    >
      <IconFilter className="h-[18px] w-[18px]" />
      {dict.catalog.filters}
      {active > 0 ? (
        <span className="t-num grid h-5 min-w-5 place-items-center rounded-full bg-signal px-1.5 text-[12px] text-black">
          {active}
        </span>
      ) : null}
    </button>
  );
}

/** Группа фасета по характеристике: больше 4 значений — прячем за «Ще N». */
function SpecGroup({
  title,
  facet,
  selected,
  onToggle,
  moreLabel,
}: {
  title: string;
  facet: SpecFacet;
  selected: string[];
  onToggle: (slug: string) => void;
  moreLabel: (n: number) => string;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? facet.options : facet.options.slice(0, 4);
  const hidden = facet.options.length - visible.length;

  return (
    <Group title={title}>
      {visible.map((option) => (
        <Check
          key={option.slug}
          checked={selected.includes(option.slug)}
          onChange={() => onToggle(option.slug)}
          label={option.label}
          count={option.count}
        />
      ))}
      {hidden > 0 ? (
        <button type="button" onClick={() => setExpanded(true)} className="mt-1 text-sm text-signal-text hover:underline">
          {moreLabel(hidden)}
        </button>
      ) : null}
    </Group>
  );
}

/**
 * Выбранные фильтры чипами: каждый снимается одним нажатием.
 * То, что уже видно строкой быстрых чипов над сеткой, здесь второй раз не показываем — иначе
 * один и тот же фильтр стоит на экране трижды (чип + чекбокс в панели + этот ряд).
 */
export function ActiveFilters({ category }: { category?: string }) {
  const { dict, locale } = useI18n();
  const { query, push } = useCatalogQuery();
  const mounted = useMounted();
  const savedPlatformRaw = usePlatform((state) => state.slug);
  const savedPlatform = mounted ? savedPlatformRaw ?? undefined : undefined;
  const quick = category ? computeQuickChips(category, locale, savedPlatform) : null;

  const chips: { key: string; label: string; remove: () => void }[] = [];
  for (const slug of query.brands) {
    const name = brands.find((brand) => brand.slug === slug)?.name ?? slug;
    chips.push({ key: `b-${slug}`, label: name, remove: () => push({ ...query, brands: query.brands.filter((v) => v !== slug) }) });
  }
  for (const slug of query.platforms) {
    if (quick?.platform === slug) continue;
    const name = platforms.find((platform) => platform.slug === slug)?.name ?? slug;
    chips.push({ key: `p-${slug}`, label: name, remove: () => push({ ...query, platforms: query.platforms.filter((v) => v !== slug) }) });
  }
  if (query.power && !(query.power === "cordless" && quick?.cordless))
    chips.push({
      key: "power",
      label: query.power === "corded" ? dict.catalog.corded : dict.catalog.cordless,
      remove: () => push({ ...query, power: undefined }),
    });
  if (query.min || query.max)
    chips.push({
      key: "price",
      label: `${query.min ?? "0"} – ${query.max ?? "∞"} ₴`,
      remove: () => push({ ...query, min: undefined, max: undefined }),
    });
  if (query.inStock && !quick?.inStock)
    chips.push({ key: "stock", label: dict.catalog.inStockOnly, remove: () => push({ ...query, inStock: false }) });
  if (query.onSale && !quick?.sale)
    chips.push({ key: "sale", label: dict.catalog.onSaleOnly, remove: () => push({ ...query, onSale: false }) });
  for (const [specKey, values] of Object.entries(query.specs)) {
    for (const slug of values) {
      if (quick?.spec && quick.spec.key === specKey && quick.spec.slug === slug) continue;
      chips.push({
        key: `s-${specKey}-${slug}`,
        // Слаг — украинский текст значения с «_» вместо «,»: для чипа хватает читаемого приближения.
        label: `${specLabels[specKey as keyof typeof specLabels]?.[locale] ?? specKey}: ${slug.replace(/_/g, ",")}`,
        remove: () =>
          push({
            ...query,
            specs: { ...query.specs, [specKey]: values.filter((v) => v !== slug) },
          }),
      });
    }
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2.5 pb-6">
      <span className="text-[15px] text-bone-dim">{dict.catalog.selected}:</span>
      {chips.map((chip) => (
        <span key={chip.key} className="chip !h-9 !gap-1 !pr-1.5 text-sm">
          {chip.label}
          <button
            type="button"
            onClick={chip.remove}
            aria-label={dict.catalog.removeFilter(chip.label)}
            className="grid h-7 w-7 place-items-center rounded-full text-bone-dim transition-colors hover:text-bone"
          >
            <IconClose className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </span>
      ))}
    </div>
  );
}

function SavedPlatform({
  slug,
  applied,
  onToggle,
  label,
}: {
  slug: string;
  applied: boolean;
  onToggle: () => void;
  label: string;
}) {
  const platform = platforms.find((item) => item.slug === slug);
  const mounted = useMounted();
  if (!mounted || !platform) return null;

  return (
    <div className="border-b border-[var(--hair)] py-5">
      <button type="button" onClick={onToggle} aria-pressed={applied} className="chip !h-11 w-full !justify-start">
        <IconBattery className="h-5 w-5 shrink-0" />
        <span className="text-bone-dim">{label}</span>
        <span className="font-medium">{platform.name}</span>
      </button>
    </div>
  );
}

function Group({ title, children, last }: { title: string; children: React.ReactNode; last?: boolean }) {
  return (
    <section className={`pb-2 pt-5 ${last ? "" : "border-b border-[var(--hair)]"}`}>
      <p className="text-base font-medium text-bone">{title}</p>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Check({
  checked,
  onChange,
  label,
  count,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  count?: number;
}) {
  return (
    <label className="flex min-h-11 items-center gap-3 text-base text-bone">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="check"
      />
      <span className="flex-1">{label}</span>
      {count !== undefined ? <span className="text-sm text-bone-dim">{count}</span> : null}
    </label>
  );
}

function PriceRange({ query, onChange }: { query: CatalogQuery; onChange: (next: CatalogQuery) => void }) {
  const { dict } = useI18n();
  const [min, setMin] = useState(query.min ? String(query.min) : "");
  const [max, setMax] = useState(query.max ? String(query.max) : "");

  const commit = () =>
    onChange({
      ...query,
      min: min ? Number(min) : undefined,
      max: max ? Number(max) : undefined,
    });

  const input = "field !h-12 !px-3.5 text-[15px] t-num";

  return (
    <div className="flex items-center gap-2.5 pb-3">
      <input
        inputMode="numeric"
        value={min}
        onChange={(event) => setMin(event.target.value.replace(/\D/g, ""))}
        onBlur={commit}
        onKeyDown={(event) => event.key === "Enter" && commit()}
        placeholder={dict.catalog.priceFrom}
        aria-label={dict.catalog.priceFrom}
        className={input}
      />
      <span className="text-bone-dim">—</span>
      <input
        inputMode="numeric"
        value={max}
        onChange={(event) => setMax(event.target.value.replace(/\D/g, ""))}
        onBlur={commit}
        onKeyDown={(event) => event.key === "Enter" && commit()}
        placeholder={dict.catalog.priceTo}
        aria-label={dict.catalog.priceTo}
        className={input}
      />
    </div>
  );
}

/**
 * Сортировка отдельно: она живёт над сеткой, а не в колонке фильтров. На телефоне рендерится
 * второй раз в общей пилюльной строке с кнопкой «Фільтри» — className задаёт, тянется ли она
 * на всю ширину своей ячейки.
 */
export function SortSelect({ className = "" }: { className?: string }) {
  const { dict } = useI18n();
  const { query, push } = useCatalogQuery();

  const options = [
    { value: "popular", label: dict.catalog.sortPopular },
    { value: "cheap", label: dict.catalog.sortCheap },
    { value: "expensive", label: dict.catalog.sortExpensive },
    { value: "new", label: dict.catalog.sortNew },
    { value: "inStock", label: dict.catalog.sortInStock },
  ] as const;

  return (
    <label className={`flex items-center gap-3 text-[15px] text-bone-dim ${className}`}>
      <span className="hidden shrink-0 whitespace-nowrap sm:block">{dict.catalog.sort}</span>
      <select
        value={query.sort}
        onChange={(event) => push({ ...query, sort: event.target.value as CatalogQuery["sort"] })}
        className="h-11 min-w-0 flex-1 rounded-full border border-[var(--hair-strong)] bg-ink-900 px-4 text-[15px] text-bone outline-none focus:border-signal"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
