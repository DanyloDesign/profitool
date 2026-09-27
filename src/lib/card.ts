import type { Locale } from "@/i18n";
import { specLabels } from "@/data/taxonomy";
import { localize, type Product, type SpecKey } from "@/data/types";

/** Two lines of the card's reveal panel hold about this many characters. */
const SHORT_MAX = 72;

/**
 * One line for the card's hover reveal: `product.short` when set, otherwise the first sentence
 * of the description, cut at its colon or dash when the sentence runs past two lines.
 */
export function shortOf(product: Product, locale: Locale): string {
  if (product.short) return product.short[locale];
  const text = product.description[locale];
  const sentence = (text.match(/^(.+?[.!?])(\s|$)/)?.[1] ?? text).trim();
  if (sentence.length <= SHORT_MAX) return sentence;
  const cut = sentence.search(/:\s| — | – /);
  if (cut >= 18 && cut <= SHORT_MAX) return `${sentence.slice(0, cut)}.`;
  return sentence;
}

/** Specs the card's key line already covers, or the kit line says better. */
const SKIP_IN_REVEAL: SpecKey[] = ["battery", "voltage"];

/** Three specs for the reveal panel, other than the one in the card's key line. */
export function revealSpecs(product: Product, locale: Locale, count = 3): { key: SpecKey; label: string; value: string }[] {
  return product.specs
    .filter(([key]) => key !== product.key.spec && !SKIP_IN_REVEAL.includes(key))
    .slice(0, count)
    .map(([key, value]) => ({ key, label: specLabels[key][locale], value: localize(value, locale) }));
}
