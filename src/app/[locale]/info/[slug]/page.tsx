import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDict, isLocale, locales, type Locale } from "@/i18n";
import type { ReactNode } from "react";
import {
  deliveryOptions,
  infoBySlug,
  infoPages,
  paymentPicker,
  privacyView,
  returnsCheck,
  warrantyCheck,
  type InfoSlug,
} from "@/data/info";
import { href } from "@/lib/shop";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { InfoNav } from "@/components/info/info-nav";
import { DeliveryOptions } from "@/components/info/delivery-options";
import { PaymentPicker } from "@/components/info/payment-picker";
import { ReturnsCheck } from "@/components/info/returns-check";
import { WarrantyCheck } from "@/components/info/warranty-check";
import { PrivacyView } from "@/components/info/privacy-view";

type Params = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return locales.flatMap((locale) => infoPages.map((page) => ({ locale, slug: page.slug })));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = infoBySlug.get(slug);
  if (!page || !isLocale(locale)) return {};
  return {
    title: `${page.title[locale]} — Profitool`,
    description: page.lead[locale],
  };
}

export default async function InfoPage({ params }: Params) {
  const { locale: rawLocale, slug } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  const page = infoBySlug.get(slug);
  if (!page) notFound();
  const dict = getDict(locale);

  const crumbs = [{ label: dict.common.home, href: href(locale) }, { label: page.title[locale] }];

  // Every info page is a single-screen interactive page: same compact frame, own body.
  const bodies: Record<InfoSlug, { intro: string; body: ReactNode }> = {
    delivery: { intro: deliveryOptions.intro[locale], body: <DeliveryOptions /> },
    payment: { intro: paymentPicker.intro[locale], body: <PaymentPicker /> },
    returns: { intro: returnsCheck.intro[locale], body: <ReturnsCheck /> },
    warranty: { intro: warrantyCheck.intro[locale], body: <WarrantyCheck /> },
    privacy: { intro: privacyView.intro[locale], body: <PrivacyView /> },
  };
  const { intro, body } = bodies[page.slug];

  return (
    <div className="shell pb-6 pt-5">
      <Breadcrumbs items={crumbs} label={dict.catalog.breadcrumbs} />
      <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-x-16 gap-y-5 lg:grid-cols-[180px_minmax(0,1fr)]">
        <div className="min-w-0 lg:sticky lg:top-[calc(var(--header-h)+24px)] lg:self-start">
          <InfoNav locale={locale} current={page.slug} label={dict.info.navLabel} />
        </div>
        <article className="min-w-0">
          {/* Long Unbounded words can outgrow a 390px screen: break rather than scroll the page. */}
          <h1 className="t-h2 text-bone break-words">{page.title[locale]}</h1>
          <p className="mt-2 max-w-[640px] text-lg leading-snug text-bone-dim">{intro}</p>
          {body}
        </article>
      </div>
    </div>
  );
}
