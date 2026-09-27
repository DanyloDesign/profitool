import { notFound } from "next/navigation";
import { isLocale, locales } from "@/i18n";
import { categories, categoryBySlug } from "@/data/taxonomy";
import { CatalogView } from "@/components/catalog/catalog-view";

type Params = {
  params: Promise<{ locale: string; slug?: string[] }>;
};

/** Корень каталога и все разделы — для статической сборки. */
export function generateStaticParams() {
  return locales.flatMap((locale) => [
    { locale, slug: [] as string[] },
    ...categories.map((item) => ({ locale, slug: [item.slug] })),
  ]);
}

export default async function CatalogPage({ params }: Params) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const categorySlug = slug?.[0];
  if (categorySlug && !categoryBySlug.get(categorySlug)) notFound();
  return <CatalogView locale={locale} categorySlug={categorySlug} />;
}
