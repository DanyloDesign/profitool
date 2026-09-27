"use client";

import { useRef, useState } from "react";
import { useI18n } from "@/i18n/context";
import type { Dict, Locale } from "@/i18n";
import { specLabels } from "@/data/taxonomy";
import { kitNoBattery } from "@/data/products";
import { localize, type Product } from "@/data/types";
import { IconCheck, IconChevron, IconClose } from "@/components/ui/icons";

/** Отзывов и рейтингов в проекте нет намеренно (CLAUDE.md) — вкладки только по реальным данным. */
const TAB_IDS = ["specs", "description", "kit"] as const;
type TabId = (typeof TAB_IDS)[number];

/**
 * Блоки характеристик, описания и комплектации: Tabs на ≥1024px, аккордеон ниже — тот же контент,
 * доступный accordion-паттерн (button + aria-expanded). Десктопный Tabs всегда держит одну активную
 * вкладку; мобильный аккордеон — независимое состояние, второй тап по открытой секции закрывает её.
 */
export function ProductTabs({ product }: { product: Product }) {
  const { locale, dict } = useI18n();
  const [activeTab, setActiveTab] = useState<TabId>(TAB_IDS[0]);
  const [openId, setOpenId] = useState<TabId | null>(TAB_IDS[0]);
  const tabRefs = useRef<Partial<Record<TabId, HTMLButtonElement | null>>>({});

  const labels: Record<TabId, string> = {
    specs: dict.product.specs,
    description: dict.product.description,
    kit: dict.product.kit,
  };

  function onKeyDown(event: React.KeyboardEvent, id: TabId) {
    const idx = TAB_IDS.indexOf(id);
    let next: TabId | null = null;
    if (event.key === "ArrowRight") next = TAB_IDS[(idx + 1) % TAB_IDS.length];
    else if (event.key === "ArrowLeft") next = TAB_IDS[(idx - 1 + TAB_IDS.length) % TAB_IDS.length];
    else if (event.key === "Home") next = TAB_IDS[0];
    else if (event.key === "End") next = TAB_IDS[TAB_IDS.length - 1];
    if (!next) return;
    event.preventDefault();
    setActiveTab(next);
    tabRefs.current[next]?.focus();
  }

  return (
    <div id="product-tabs">
      {/* Десктоп: настоящий tab-паттерн с ролями и стрелками. */}
      <div role="tablist" aria-label={dict.product.detailsLabel} className="hidden gap-8 border-b border-[var(--hair)] lg:flex">
        {TAB_IDS.map((id) => (
          <button
            key={id}
            ref={(el) => {
              tabRefs.current[id] = el;
            }}
            type="button"
            role="tab"
            id={`tab-${id}`}
            aria-controls={`panel-${id}`}
            aria-selected={activeTab === id}
            tabIndex={activeTab === id ? 0 : -1}
            onClick={() => setActiveTab(id)}
            onKeyDown={(event) => onKeyDown(event, id)}
            className={`t-tag min-h-11 border-b-2 pb-4 pt-1 transition-colors ${
              activeTab === id ? "border-signal text-bone" : "border-transparent text-bone-dim hover:text-bone"
            }`}
          >
            {labels[id]}
          </button>
        ))}
      </div>
      <div className="hidden lg:block">
        {TAB_IDS.map((id) => (
          <div key={id} role="tabpanel" id={`panel-${id}`} aria-labelledby={`tab-${id}`} hidden={activeTab !== id} className="pt-8">
            <TabContent id={id} product={product} locale={locale} dict={dict} />
          </div>
        ))}
      </div>

      {/* Мобильный и планшетный аккордеон: реальный expand/collapse, второй тап закрывает секцию. */}
      <div className="lg:hidden">
        {TAB_IDS.map((id) => {
          const open = openId === id;
          return (
            <div key={id} className="border-b border-[var(--hair)]">
              <button
                type="button"
                aria-expanded={open}
                aria-controls={`acc-panel-${id}`}
                onClick={() => setOpenId(open ? null : id)}
                className="flex min-h-11 w-full items-center justify-between gap-4 py-4 text-left text-base text-bone"
              >
                {labels[id]}
                {/* IconChevron рисован «›»: поворот на 90° даёт вниз (закрыто) / вверх (открыто). */}
                <IconChevron className={`h-4 w-4 shrink-0 transition-transform ${open ? "-rotate-90" : "rotate-90"}`} />
              </button>
              <div id={`acc-panel-${id}`} hidden={!open} className="pb-6">
                <TabContent id={id} product={product} locale={locale} dict={dict} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TabContent({
  id,
  product,
  locale,
  dict,
}: {
  id: TabId;
  product: Product;
  locale: Locale;
  dict: Dict;
}) {
  if (id === "specs") {
    return (
      <dl className="grid gap-x-12 md:grid-cols-2">
        {[
          ...product.specs.map(([key, value]) => [specLabels[key][locale], localize(value, locale)] as const),
          [dict.product.warranty, dict.product.warrantyValue(product.warranty)] as const,
        ].map(([label, value]) => (
          <div key={label} className="spec-row">
            <dt className="leader text-base">{label}</dt>
            <dd className="t-num text-right text-base text-bone">{value}</dd>
          </div>
        ))}
      </dl>
    );
  }

  if (id === "description") {
    return <p className="max-w-2xl text-[17px] leading-relaxed text-bone-dim">{product.description[locale]}</p>;
  }

  return (
    <ul className="grid gap-x-12 gap-y-3.5 sm:grid-cols-2">
      {product.kit.map((item) => {
        const missing = item === kitNoBattery;
        return (
          <li
            key={item[locale]}
            className={`flex items-center gap-3 text-base ${missing ? "text-bone-dim" : "text-bone"}`}
          >
            {missing ? (
              <IconClose className="h-4 w-4 shrink-0" />
            ) : (
              <IconCheck className="h-4 w-4 shrink-0 text-signal-text" />
            )}
            {item[locale]}
          </li>
        );
      })}
    </ul>
  );
}
