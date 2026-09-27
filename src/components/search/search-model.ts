import type { Locale } from "@/i18n";
import { categories } from "@/data/taxonomy";
import type { Category, Product } from "@/data/types";
import { normalize, searchCategories, searchCompletions, searchProducts } from "@/lib/search";
import { categoryHref, productHref } from "@/lib/shop";

/**
 * What the search panel shows for a query, as groups of options in the order they are drawn.
 * The panel walks the groups with one running index, so ↑↓ move through the same list the eye
 * reads: popular queries and sections for an empty field; section hits, completions and
 * products for a typed one; popular queries again when nothing matches.
 */
export type SearchOption =
  /** A query to put into the field: a popular search or a completion. */
  | { kind: "query"; text: string; head: string; tail: string }
  | { kind: "section"; category: Category; href: string }
  | { kind: "product"; product: Product; href: string };

export type SearchGroupId = "popular" | "sections" | "sectionHits" | "completions" | "products";

export type SearchGroup = { id: SearchGroupId; options: SearchOption[] };

export type SearchModel = {
  mode: "idle" | "hits" | "none";
  groups: SearchGroup[];
  /** Set when every product shown comes from the first section hit ("У розділі «…»"). */
  productsIn: Category | null;
};

/** Two meaningful characters before the panel switches from suggestions to answers. */
const MIN_QUERY = 2;

const PRODUCT_LIMIT = 3;
const SECTION_HIT_LIMIT = 2;

function queryOption(text: string): SearchOption {
  return { kind: "query", text, head: "", tail: text };
}

export function searchModel(query: string, locale: Locale, popular: string[]): SearchModel {
  const popularGroup: SearchGroup = { id: "popular", options: popular.map(queryOption) };

  if (normalize(query).length < MIN_QUERY) {
    return {
      mode: "idle",
      productsIn: null,
      groups: [
        popularGroup,
        {
          id: "sections",
          options: categories.map((category) => ({
            kind: "section",
            category,
            href: categoryHref(locale, category.slug),
          })),
        },
      ],
    };
  }

  const sectionHits = searchCategories(query).slice(0, SECTION_HIT_LIMIT);
  const completions = searchCompletions(query, locale);
  const products = searchProducts(query, PRODUCT_LIMIT);

  if (!sectionHits.length && !completions.length && !products.length) {
    return { mode: "none", productsIn: null, groups: [popularGroup] };
  }

  const first = sectionHits[0];
  const productsIn = first && products.every((product) => product.category === first.slug) ? first : null;

  const groups: SearchGroup[] = [
    {
      id: "sectionHits",
      options: sectionHits.map((category) => ({ kind: "section", category, href: categoryHref(locale, category.slug) })),
    },
    {
      id: "completions",
      options: completions.map(({ text, head, tail }) => ({ kind: "query", text, head, tail })),
    },
    {
      id: "products",
      options: products.map((product) => ({ kind: "product", product, href: productHref(locale, product.slug) })),
    },
  ];

  return { mode: "hits", productsIn, groups: groups.filter((group) => group.options.length > 0) };
}
