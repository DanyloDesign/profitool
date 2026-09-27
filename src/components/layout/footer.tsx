import Link from "next/link";
import type { Dict, Locale } from "@/i18n";
import { brands, categories } from "@/data/taxonomy";
import { categoryHref, href } from "@/lib/shop";
import { Logo } from "@/components/layout/logo";
import { IconClock, IconMapPin, IconPhone } from "@/components/ui/icons";
import { IconApplePay, IconGooglePay, IconMastercard, IconVisa } from "@/components/ui/payment-icons";
import { IconFacebook, IconInstagram, IconTelegram, IconYouTube } from "@/components/ui/social-icons";

// TODO(владелец): настоящие адреса аккаунтов. Сейчас заглушки на корень площадки.
const socials = [
  { name: "Telegram", url: "https://t.me/", Icon: IconTelegram },
  { name: "Instagram", url: "https://www.instagram.com/", Icon: IconInstagram },
  { name: "Facebook", url: "https://www.facebook.com/", Icon: IconFacebook },
  { name: "YouTube", url: "https://www.youtube.com/", Icon: IconYouTube },
];

export function Footer({ locale, dict }: { locale: Locale; dict: Dict }) {
  const link = "text-[15px] text-bone-dim transition-colors hover:text-signal-text";
  // Как в SupportMenu: dict.common.phone хранит форматированную строку, tel: нужен без пробелов.
  const phoneHref = `tel:${dict.common.phone.replace(/[^\d+]/g, "")}`;

  return (
    <footer className="mt-24 border-t border-[var(--hair)]">
      <div className="shell grid gap-12 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div className="max-w-[320px]">
          <Logo href={href(locale)} />
          <p className="mt-5 text-[15px] leading-relaxed text-bone-dim">{dict.common.footerAbout}</p>
          <ul className="mt-6 flex gap-2" aria-label={dict.common.footerSocialLabel}>
            {socials.map(({ name, url, Icon }) => (
              <li key={name}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--hair)] text-bone-dim transition-colors hover:border-signal-text hover:text-signal-text"
                >
                  <Icon />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav aria-label={dict.nav.catalog}>
          <p className="t-eyebrow text-bone">{dict.nav.catalog}</p>
          <ul className="mt-5 grid gap-3">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link href={categoryHref(locale, category.slug)} className={link}>
                  {category.name[locale]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Profitool">
          <p className="t-eyebrow text-bone">Profitool</p>
          <ul className="mt-5 grid gap-3">
            <li>
              <Link href={href(locale, "/cart")} className={link}>
                {dict.nav.cart}
              </Link>
            </li>
            <li>
              <Link href={href(locale, "/compare")} className={link}>
                {dict.nav.compare}
              </Link>
            </li>
            <li>
              <Link href={href(locale, "/wishlist")} className={link}>
                {dict.nav.wishlist}
              </Link>
            </li>
            <li>
              <Link href={href(locale, "/account")} className={link}>
                {dict.nav.account}
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <a
            href={phoneHref}
            className="t-price flex items-center gap-3 text-2xl text-bone transition-colors hover:text-signal-text"
          >
            <IconPhone className="h-5 w-5 shrink-0" />
            {dict.common.phone}
          </a>
          <div className="mt-4 grid gap-2.5">
            <p className="flex items-center gap-3 text-[15px] text-bone-dim">
              <IconMapPin className="h-4 w-4 shrink-0" />
              {dict.common.footerAddress}
            </p>
            <p className="flex items-center gap-3 text-[15px] text-bone-dim">
              <IconClock className="h-4 w-4 shrink-0" />
              {dict.common.footerHours}
            </p>
          </div>

          <div className="mt-8">
            <p className="t-eyebrow text-bone">{dict.nav.brands}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {brands.map((brand) => (
                <Link key={brand.slug} href={`${href(locale, "/catalog")}?brand=${brand.slug}`} className="chip">
                  {brand.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="shell flex flex-col gap-4 border-t border-[var(--hair)] py-6 sm:flex-row sm:items-center sm:justify-between">
        <ul className="flex flex-wrap items-center gap-2 text-bone-dim">
          <li className="sr-only">{dict.common.footerPayLabel}</li>
          {/* Знаки simple-icons займають лише середину квадрата 24×24, тому 32px і пілюля як у брендів */}
          {[
            <IconVisa key="visa" title="Visa" className="h-8 w-8" />,
            <IconMastercard key="mc" title="Mastercard" className="h-7 w-7" />,
            <IconApplePay key="apple" title="Apple Pay" className="h-8 w-8" />,
            <IconGooglePay key="google" title="Google Pay" className="h-8 w-8" />,
          ].map((icon) => (
            <li key={icon.key} className="inline-flex h-10 items-center rounded-full border border-[var(--hair)] px-3">
              {icon}
            </li>
          ))}
        </ul>
        <p className="text-sm text-bone-dim">© 2026 Profitool. {dict.common.footerRights}</p>
      </div>
    </footer>
  );
}
