import { notFound } from "next/navigation";
import { isLocale } from "@/i18n";
import { SearchView } from "@/components/search/search-view";

type Params = {
  params: Promise<{ locale: string }>;
};

export default async function SearchPage({ params }: Params) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <SearchView locale={locale} />;
}
