import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/i18n";
import { AccountView } from "@/components/account/account-view";

export default async function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDict(locale);

  return (
    <div className="shell pb-8 pt-10">
      {/* Заголовок в той же колонке 440px, что и форма, иначе на десктопе они на разных осях */}
      <h1 className="t-h1 mx-auto max-w-[440px] text-bone">{dict.account.title}</h1>
      <div className="mt-9">
        <Suspense fallback={null}>
          <AccountView />
        </Suspense>
      </div>
    </div>
  );
}
