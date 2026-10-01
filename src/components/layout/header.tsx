"use client";

import Link from "next/link";
import { useMounted } from "@/lib/use-mounted";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { swapLocale, type Locale } from "@/i18n";
import { asset } from "@/lib/asset";
import { useI18n } from "@/i18n/context";
import { categories } from "@/data/taxonomy";
import { categoryHref, categoryPhoto, countIn, href } from "@/lib/shop";
import { useCompare, useWishlist } from "@/store/shop";
import { useAccount } from "@/store/account";
import { Logo } from "@/components/layout/logo";
import { CartButton } from "@/components/cart/cart-button";
import { ThemeRow, ThemeToggle } from "@/components/layout/theme-toggle";
import { CitySelect } from "@/components/layout/city-select";
import { SupportMenu } from "@/components/layout/support-menu";
import { PlatformChip } from "@/components/layout/platform-chip";
import { MegaMenu } from "@/components/layout/mega-menu";
import { HeaderSearch } from "@/components/search/header-search";
import { IconBurger, IconClose, IconCompare, IconHeart, IconUser } from "@/components/ui/icons";

/** Four rounded squares: the "Каталог" button (015). Drawn like the icons in ui/icons.tsx. */
function IconGrid({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="4" y="4" width="6.5" height="6.5" rx="1.6" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.6" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.6" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.6" />
    </svg>
  );
}

/**
 * The header (015, pattern 2).
 *
 * From 768px one block holds every control once, laid out by `.hdr-bar` in globals.css:
 * - 768–1023px, two rows (as in 006): logo and the utility cluster on top; the burger, the search
 *   field and the action icons below.
 * - from 1024px, one 72px row: logo, "Каталог", the search field, the quiet utility cluster
 *   (city, support, language, theme, "Мої батареї"), a hairline, wishlist, compare, cart.
 * Each control exists once, so the cart modal and the theme button are not duplicated.
 * Below 768px the phone header keeps its own two rows.
 */
export function Header() {
  const { locale, dict } = useI18n();
  const pathname = usePathname();
  const megaId = useId();
  // A menu is open only on the page where it was opened: navigation closes it without an effect.
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [mobileFor, setMobileFor] = useState<string | null>(null);
  const menuOpen = menuFor === pathname;
  const mobileOpen = mobileFor === pathname;

  const closeMenus = () => {
    setMenuFor(null);
    setMobileFor(null);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuFor(null);
        setMobileFor(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const burgerLabel = dict.nav.menu;
  const burgerIcon = mobileOpen ? <IconClose className="h-6 w-6" /> : <IconBurger className="h-6 w-6" />;

  return (
    <header className="sticky top-0 z-50">
      {/* The blur sits on its own layer: backdrop-filter on the header itself would make it the
          containing block of the fixed menus, and they would collapse to its height. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 border-b border-[var(--hair)] bg-ink-900/90 backdrop-blur-xl"
      />

      {/* From 768px. */}
      <div className="relative hidden md:block">
        {/* Hairline between the two tablet rows. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-[var(--header-l1)] border-t border-[var(--hair)] lg:hidden"
        />
        <div className="hdr-bar shell">
          <Logo href={href(locale)} variant="bar" className="justify-self-start [grid-area:logo]" />

          {/* 768–1023: the burger opens the phone menu (sections) in place of "Каталог". */}
          <button
            type="button"
            onClick={() => setMobileFor(mobileOpen ? null : pathname)}
            aria-expanded={mobileOpen}
            aria-label={burgerLabel}
            data-menu-trigger="tablet"
            className="icon-btn -ml-2.5 shrink-0 !text-bone [grid-area:burger] lg:hidden"
          >
            {burgerIcon}
          </button>

          <button
            type="button"
            onClick={() => setMenuFor(menuOpen ? null : pathname)}
            aria-expanded={menuOpen}
            aria-controls={menuOpen ? megaId : undefined}
            data-menu-trigger="desktop"
            className="hidden h-11 shrink-0 items-center gap-2.5 rounded-full bg-bone pl-3.5 pr-[18px] text-[15px] font-medium text-ink-900 transition-opacity duration-[var(--dur-fast)] hover:opacity-85 active:translate-y-px lg:ml-2 lg:inline-flex"
          >
            {menuOpen ? (
              <IconClose className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
            ) : (
              <IconGrid className="h-[18px] w-[18px] shrink-0" />
            )}
            {dict.nav.catalog}
          </button>

          <HeaderSearch
            variant="bar"
            onOpen={closeMenus}
            className="min-w-0 [grid-area:search] lg:min-w-[200px] lg:max-w-[620px] lg:flex-1"
          />

          <div className="hdr-util flex shrink-0 items-center justify-self-end [grid-area:util] lg:ml-auto">
            <CitySelect />
            <SupportMenu />
            <LangSwitch locale={locale} pathname={pathname} />
            <ThemeToggle />
            <PlatformChip />
          </div>

          <span aria-hidden className="hidden h-6 w-px shrink-0 bg-[var(--hair)] lg:block" />

          <div className="flex shrink-0 items-center gap-0.5 justify-self-end [grid-area:actions]">
            <Actions />
          </div>
        </div>
      </div>

      {/* Below 768px: its own two rows (burger, logo, account, cart / search). Catalog, city and
          language live in the phone menu. */}
      <div className="relative md:hidden">
        <div className="shell relative flex h-[var(--header-l1)] items-center gap-2 border-b border-[var(--hair)]">
          <button
            type="button"
            onClick={() => setMobileFor(mobileOpen ? null : pathname)}
            aria-expanded={mobileOpen}
            aria-label={burgerLabel}
            data-menu-trigger="mobile"
            className="icon-btn -ml-2.5 shrink-0 !text-bone"
          >
            {burgerIcon}
          </button>

          <Logo href={href(locale)} className="min-w-0 overflow-hidden" />

          <div className="ml-auto flex shrink-0 items-center gap-0.5">
            <Link
              href={href(locale, "/account")}
              aria-label={dict.nav.account}
              aria-current={pathname.endsWith("/account") ? "page" : undefined}
              className="icon-btn shrink-0 !text-bone"
            >
              <IconUser className="h-[22px] w-[22px]" />
            </Link>

            <CartButton withModal={false} />
          </div>
        </div>

        <div className="shell relative flex h-[var(--header-l2)] items-center">
          <HeaderSearch variant="phone" onOpen={closeMenus} className="w-full" />
        </div>
      </div>

      {menuOpen ? <MegaMenu id={megaId} onClose={() => setMenuFor(null)} /> : null}
      {mobileOpen ? <MobileMenu pathname={pathname} /> : null}
    </header>
  );
}

/**
 * Action icons from 768px: account icon (tablet only), wishlist, compare, cart. From 1024px the
 * account is a labelled pill after the cart, in the top right corner (019, owner's request).
 */
function Actions() {
  const { locale, dict } = useI18n();
  const mounted = useMounted();
  const compareCount = useCompare((state) => state.slugs.length);
  const wishCount = useWishlist((state) => state.slugs.length);
  const pathname = usePathname();

  return (
    <>
      <IconLink
        to={href(locale, "/account")}
        label={dict.nav.account}
        current={pathname.endsWith("/account")}
        className="lg:hidden"
      >
        <IconUser className="h-[22px] w-[22px]" />
      </IconLink>
      <IconLink
        to={href(locale, "/wishlist")}
        label={dict.nav.wishlist}
        count={mounted ? wishCount : 0}
        current={pathname.endsWith("/wishlist")}
      >
        <IconHeart className="h-[22px] w-[22px]" />
      </IconLink>
      <IconLink
        to={href(locale, "/compare")}
        label={dict.nav.compare}
        count={mounted ? compareCount : 0}
        current={pathname.endsWith("/compare")}
      >
        <IconCompare className="h-[22px] w-[22px]" />
      </IconLink>

      <CartButton />
      <AccountPill />
    </>
  );
}

/**
 * Guest: "Увійти" leads to /account, where sign-in and registration are two tabs. Signed in: an
 * initial and the first name, leads to the profile. Before hydration the guest state renders, the
 * session lives in localStorage.
 */
function AccountPill() {
  const { locale, dict } = useI18n();
  const mounted = useMounted();
  const session = useAccount((state) => state.session);
  const pathname = usePathname();

  const user = mounted ? session : null;
  const firstName = user?.name.trim().split(/\s+/)[0] ?? "";
  const current = pathname.includes("/account");

  return (
    <Link
      href={href(locale, user ? "/account/profile" : "/account")}
      aria-label={user ? `${dict.nav.account}: ${user.name}` : undefined}
      aria-current={current ? "page" : undefined}
      className={`ml-1 hidden h-11 shrink-0 items-center gap-2 rounded-full border text-[15px] font-medium text-bone transition-colors duration-[var(--dur-fast)] hover:border-signal lg:inline-flex ${
        user ? "pl-1.5 pr-4" : "pl-3.5 pr-4"
      } ${current ? "border-signal" : "border-[var(--hair-strong)]"}`}
    >
      {user ? (
        <>
          <span
            aria-hidden
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-bone text-sm font-semibold leading-none text-ink-900"
          >
            {firstName.charAt(0).toUpperCase()}
          </span>
          <span className="max-w-[12ch] truncate">{firstName}</span>
        </>
      ) : (
        <>
          <IconUser className="h-5 w-5 shrink-0" />
          {dict.account.submitLogin}
        </>
      )}
    </Link>
  );
}

function IconLink({
  to,
  label,
  count = 0,
  current,
  className = "",
  children,
}: {
  to: string;
  label: string;
  count?: number;
  current?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={to}
      aria-label={count > 0 ? `${label}, ${count}` : label}
      aria-current={current ? "page" : undefined}
      className={`relative grid h-11 w-11 shrink-0 place-items-center rounded-full transition-colors duration-[var(--dur-fast)] ${
        current ? "text-signal-text" : "text-bone hover:text-bone-dim"
      } ${className}`}
    >
      {children}
      {count > 0 ? (
        <span className="t-num absolute -right-1 -top-0.5 grid h-[22px] min-w-[22px] place-items-center rounded-full bg-bone px-1.5 text-sm leading-none text-ink-900">
          {count}
        </span>
      ) : null}
    </Link>
  );
}

/**
 * Language in the utility cluster: shows the CURRENT locale ("Укр"/"Рус"), a click switches to
 * the other one. A plain link, not <Link>: switching the locale changes the root layout, and a
 * client re-render would touch the theme <script> in <head> (a React 19 console error). A full
 * load is cheaper.
 */
function LangSwitch({ locale, pathname }: { locale: Locale; pathname: string }) {
  const { dict } = useI18n();
  const other: Locale = locale === "ua" ? "ru" : "ua";
  const currentLabel = locale === "ua" ? "Укр" : "Рус";

  return (
    <a
      href={asset(swapLocale(pathname, other))}
      hrefLang={other === "ua" ? "uk" : "ru"}
      aria-label={`${dict.nav.language}: ${currentLabel}`}
      className="bar-btn shrink-0"
    >
      {currentLabel}
    </a>
  );
}

function MobileMenu({ pathname }: { pathname: string }) {
  const { locale, dict } = useI18n();
  const other: Locale = locale === "ua" ? "ru" : "ua";

  return (
    <div className="fixed inset-x-0 bottom-0 top-[var(--header-h)] overflow-y-auto bg-ink-900 lg:hidden">
      <div className="shell pb-10 pt-2">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={categoryHref(locale, category.slug)}
            className="flex items-center gap-4 border-b border-[var(--hair)] py-3"
          >
            <span className="relative h-14 w-14 shrink-0">
              <Image src={categoryPhoto(category.slug)} alt="" fill sizes="56px" className="object-contain" />
            </span>
            <span className="flex-1 text-[18px] font-medium text-bone">{category.name[locale]}</span>
            <span className="text-[15px] text-bone-dim">{countIn(category.slug)}</span>
          </Link>
        ))}

        {/* City, support, wishlist, compare, theme and language repeat the header from 768px, so
            they stay here for phones only. Account is always in the phone header. */}
        <div className="mt-6 grid gap-2 md:hidden">
          <CitySelect fullWidth />
          <SupportMenu variant="full" />
        </div>

        <div className="mt-2 grid gap-1 md:hidden">
          <MenuLink to={href(locale, "/compare")} icon={<IconCompare className="h-5 w-5" />}>
            {dict.nav.compare}
          </MenuLink>
          <MenuLink to={href(locale, "/wishlist")} icon={<IconHeart className="h-5 w-5" />}>
            {dict.nav.wishlist}
          </MenuLink>
          <ThemeRow />
        </div>

        <div className="mt-6 flex items-center gap-3 md:hidden">
          <span className="text-[15px] text-bone-dim">{dict.nav.language}</span>
          {/* Full load, as in LangSwitch. */}
          <a href={asset(swapLocale(pathname, other))} hrefLang={other === "ua" ? "uk" : "ru"} className="chip">
            {other === "ua" ? "Українська" : "Русский"}
          </a>
        </div>
      </div>
    </div>
  );
}

function MenuLink({ to, icon, children }: { to: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link href={to} className="flex h-12 items-center gap-4 text-[17px] text-bone">
      <span className="text-bone-dim">{icon}</span>
      {children}
    </Link>
  );
}
