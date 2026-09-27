import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/i18n";
import { CartView } from "@/components/cart/cart-view";

export default async function CartPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDict(locale);

  return (
    <div className="shell pb-8 pt-10">
      <h1 className="t-h1 text-bone">{dict.cart.title}</h1>
      <div className="mt-9">
        <CartView />
      </div>
    </div>
  );
}
