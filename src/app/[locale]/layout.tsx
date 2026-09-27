import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Golos_Text, Unbounded } from "next/font/google";
import "../globals.css";
import { getDict, htmlLang, isLocale, locales, type Locale } from "@/i18n";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CompareBar } from "@/components/catalog/compare-bar";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { LocaleProvider } from "@/i18n/context";
import { THEME_SCRIPT } from "@/lib/theme";
import { asset } from "@/lib/asset";
import { IconGradientDefs } from "@/components/ui/icons";

/** Заголовки, цены, слово в логотипе. Полная кириллица, включая ґ є і ї. */
const unbounded = Unbounded({
  subsets: ["cyrillic", "latin"],
  weight: ["600", "900"],
  variable: "--font-unbounded",
  display: "swap",
});

/** Весь остальной текст. */
const golos = Golos_Text({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500", "600"],
  variable: "--font-golos",
  display: "swap",
});

type LocaleParams = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDict(isLocale(locale) ? locale : "ua");
  return {
    // Адрес нужен, чтобы OG-картинка получила полный URL. Настоящий домен задаётся в NEXT_PUBLIC_SITE_URL.
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    title: dict.meta.title,
    description: dict.meta.description,
    icons: {
      icon: [
        { url: asset("/brand/logo.svg"), type: "image/svg+xml" },
        { url: asset("/brand/mark-32.png"), sizes: "32x32", type: "image/png" },
      ],
      apple: asset("/brand/apple-touch-icon.png"),
    },
    openGraph: {
      title: dict.meta.title,
      description: dict.meta.description,
      images: [{ url: asset("/brand/og-base.png"), width: 1200, height: 630 }],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleParams & { children: React.ReactNode }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const typed: Locale = locale;
  const dict = getDict(typed);

  return (
    <html
      lang={htmlLang[typed]}
      className={`${unbounded.variable} ${golos.variable}`}
      data-theme="light"
      suppressHydrationWarning
    >
      <head>
        {/* Тема до первой отрисовки, иначе сохранённая тёмная мигает белым. Смена локали идёт
            полной загрузкой (обычная ссылка), иначе React 19 перерисует этот <script> на клиенте
            и напишет ошибку в консоль. next/script beforeInteractive не успевает до отрисовки. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      {/* Расширения браузера дописывают свои атрибуты в body до гидратации, React ругается на несовпадение. */}
      <body suppressHydrationWarning>
        <LocaleProvider locale={typed}>
          {/* Один спрайт-градиент на всю сторінку: активні іконки порівняння/обраного (006, round 2). */}
          <IconGradientDefs />
          <Header />
          <main className="min-h-[60vh]">{children}</main>
          <Footer locale={typed} dict={dict} />
          <CompareBar />
          {/* 015: one cart drawer for the whole app, opened by announceAdded() and the header pill. */}
          <CartDrawer />
        </LocaleProvider>
      </body>
    </html>
  );
}
