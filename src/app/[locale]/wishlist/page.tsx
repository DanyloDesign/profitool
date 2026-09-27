import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/i18n";
import { WishlistView } from "@/components/catalog/wishlist-view";

export default async function WishlistPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDict(locale);

  return (
    <div className="shell pb-8 pt-10">
      <h1 className="t-h1 text-bone">{dict.wishlist.title}</h1>
      <div className="mt-9">
        <WishlistView />
      </div>
    </div>
  );
}
