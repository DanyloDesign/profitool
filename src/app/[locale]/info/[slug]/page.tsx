import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDict, isLocale, locales, type Locale } from "@/i18n";
import { deliveryCalc, infoBySlug, infoPages } from "@/data/info";
import { href } from "@/lib/shop";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { InfoNav } from "@/components/info/info-nav";
import { DeliveryCalculator } from "@/components/info/delivery-calculator";

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

  const tokens: Record<string, string> = {
    "{phone}": dict.common.phone,
    "{address}": dict.common.footerAddress,
    "{hours}": dict.common.footerHours,
  };
  const fill = (text: string) => text.replace(/\{(phone|address|hours)\}/g, (token) => tokens[token]);

  const crumbs = [{ label: dict.common.home, href: href(locale) }, { label: page.title[locale] }];

  if (slug === "delivery") {
    return (
      <div className="shell pb-6 pt-5">
        <Breadcrumbs items={crumbs} label={dict.catalog.breadcrumbs} />
        <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-x-16 gap-y-5 lg:grid-cols-[180px_minmax(0,1fr)]">
          <div className="min-w-0 lg:sticky lg:top-[calc(var(--header-h)+24px)] lg:self-start">
            <InfoNav locale={locale} current={page.slug} label={dict.info.navLabel} />
          </div>
          <article className="min-w-0">
            <h1 className="t-h2 text-bone break-words">{page.title[locale]}</h1>
            <p className="mt-2 max-w-[640px] text-lg leading-snug text-bone-dim">{deliveryCalc.intro[locale]}</p>
            <DeliveryCalculator />
          </article>
        </div>
      </div>
    );
  }

  return (
    <div className="shell pb-8 pt-7">
      <Breadcrumbs items={crumbs} label={dict.catalog.breadcrumbs} />

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-x-16 gap-y-8 lg:mt-8 lg:grid-cols-[200px_minmax(0,680px)]">
        <div className="min-w-0 lg:sticky lg:top-[calc(var(--header-h)+24px)] lg:self-start">
          <InfoNav locale={locale} current={page.slug} label={dict.info.navLabel} />
        </div>

        <article className="min-w-0">
          {/* Long Unbounded words can outgrow a 390px screen: break rather than scroll the page. */}
          <h1 className="t-h1 text-bone break-words">{page.title[locale]}</h1>
          <p className="mt-4 text-lg leading-snug text-bone-dim">{page.lead[locale]}</p>

          {page.figures ? (
            <dl className="mt-8 border-t border-[var(--hair)]">
              {page.figures.map((figure) => (
                <div
                  key={figure.label.ua}
                  className="flex flex-col gap-1 border-b border-[var(--hair)] py-4 last:border-b-0 sm:flex-row sm:items-baseline sm:gap-6"
                >
                  <dd className="t-section order-1 text-bone sm:w-[300px] sm:shrink-0">{figure.value[locale]}</dd>
                  <dt className="order-2 text-base text-bone-dim">{figure.label[locale]}</dt>
                </div>
              ))}
            </dl>
          ) : null}

          {page.sections.map((section) => (
            <section key={section.heading.ua} className="mt-8 border-t border-[var(--hair)] pt-6 first:mt-8">
              <h2 className="t-h3 text-bone">{section.heading[locale]}</h2>
              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph.ua} className="mt-3 text-base leading-relaxed text-bone">
                  {fill(paragraph[locale])}
                </p>
              ))}
              {section.list ? (
                <ul className="mt-3 grid list-disc gap-2 pl-5 text-base leading-relaxed text-bone marker:text-bone-dim">
                  {section.list.map((item) => (
                    <li key={item.ua}>{fill(item[locale])}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </article>
      </div>
    </div>
  );
}
