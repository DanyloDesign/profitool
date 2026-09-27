import { notFound } from "next/navigation";
import { isLocale } from "@/i18n";
import { CheckoutForm } from "@/components/cart/checkout-form";

export default async function CheckoutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  // Заголовок «Оформлення» рендерить сам CheckoutForm: на екрані підтвердження (proposal 013,
  // C.1) його навмисно немає, і серверний компонент цього стану не знає.
  return (
    <div className="shell pb-8 pt-10">
      <CheckoutForm />
    </div>
  );
}
