"use client";

import Link from "next/link";
import { useMounted } from "@/lib/use-mounted";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { swapLocale, type Locale } from "@/i18n";
import { asset } from "@/lib/asset";
import { useI18n } from "@/i18n/context";
import { brands, categories, platforms } from "@/data/taxonomy";
import {
  bestsellers,
  categoryHref,
  categoryIcon,
  countForPlatform,
  countIn,
  href,
  imageOf,
  price,
  productHref,
} from "@/lib/shop";
import { useCompare, useWishlist } from "@/store/shop";
import { Logo } from "@/components/layout/logo";
import { CartButton } from "@/components/cart/cart-button";
import { ThemeRow, ThemeToggle } from "@/components/layout/theme-toggle";
import { CitySelect } from "@/components/layout/city-select";
import { SupportMenu } from "@/components/layout/support-menu";
import {
  IconBurger,
  IconClose,
  IconCompare,
  IconHeart,
  IconSearch,
  IconUser,
} from "@/components/ui/icons";

export function Header() {
  const { locale, dict } = useI18n();
  const pathname = usePathname();
  // Меню открыто только на той странице, где его открыли: при переходе оно закрывается
  // само, без setState в эффекте.
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [mobileFor, setMobileFor] = useState<string | null>(null);
  const menuOpen = menuFor === pathname;
  const mobileOpen = mobileFor === pathname;

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
      {/* Размытие на отдельном слое: backdrop-filter у самой шапки сделал бы её
          «содержащим блоком» для fixed-меню, и оно схлопнулось бы по высоте шапки. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 border-b border-[var(--hair)] bg-ink-900/90 backdrop-blur-xl"
      />

      {/* Шар 1 (від 768px): логотип ліворуч, місто/підтримка/мова/тема праворуч — структура
          референсу (006). На мобільному (<768) ці елементи живуть у MobileMenu, тут їх немає. */}
      <div className="relative hidden border-b border-[var(--hair)] md:block">
        <div className="shell relative flex h-[var(--header-l1)] items-center justify-between gap-4">
          <Logo href={href(locale)} compact />
          <div className="flex shrink-0 items-center gap-1">
            <CitySelect />
            <SupportMenu />
            <LangSwitch locale={locale} pathname={pathname} />
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Шар 2 (від 768px): каталог (бургер на планшеті) → пошук → іконки дій. */}
      <div className="relative hidden md:block">
        <div className="shell relative flex h-[var(--header-l2)] items-center gap-3 lg:gap-6">
          {/* 768–1023: бургер відкриває той самий MobileMenu (категорії), займає місце
              кнопки «Каталог» — простіше, ніж стискати грід MegaMenu на планшетній ширині. */}
          <button
            type="button"
            onClick={() => setMobileFor(mobileOpen ? null : pathname)}
            aria-expanded={mobileOpen}
            aria-label={burgerLabel}
            data-menu-trigger="tablet"
            className="icon-btn shrink-0 !text-bone lg:hidden"
          >
            {burgerIcon}
          </button>

          {/* Не кнопка-заливка (006, раунд 2): бургер + напис, текст крупніший і жирніший,
              залитий градієнтом логотипа через background-clip:text. У світлій темі кінці
              градієнта темніші (brand-a-text/b-text) — сирі brand-a/b дають лише 2,1–2,8:1 на
              білому. Бургер лишається одним кольором (кінець градієнта), два градієнтні
              елементи поруч виглядали б строкато. Ховер — лёгкий зсув угору, без відскоку
              (transition-transform, не translate+bounce-easing). */}
          <button
            type="button"
            onClick={() => setMenuFor(menuOpen ? null : pathname)}
            aria-expanded={menuOpen}
            data-menu-trigger="desktop"
            className="hidden h-11 shrink-0 items-center gap-2.5 rounded-full transition-transform duration-150 ease-out hover:-translate-y-0.5 active:translate-y-0 lg:inline-flex"
          >
            {menuOpen ? (
              <IconClose className="h-5 w-5 shrink-0 text-brand-b-text" />
            ) : (
              <IconBurger className="h-5 w-5 shrink-0 text-brand-b-text" />
            )}
            <span
              style={{ backgroundImage: "var(--grad-brand-text)" }}
              className="bg-clip-text font-display text-[19px] font-semibold text-transparent"
            >
              {dict.nav.catalog}
            </span>
          </button>

          <SearchBox className="relative max-w-[660px] flex-1" />

          <div className="ml-auto flex shrink-0 items-center gap-0.5">
            <Actions />
          </div>
        </div>
      </div>

      {/* Мобільний (<768): два ряди свої, а не шари — склад інший (без каталогу й мови в шапці,
          вони в MobileMenu), тому окремий блок, а не приховані/показані версії шару 2. */}
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
          <SearchBox className="relative w-full" />
        </div>
      </div>

      {menuOpen ? <MegaMenu onClose={() => setMenuFor(null)} /> : null}
      {mobileOpen ? <MobileMenu pathname={pathname} /> : null}
    </header>
  );
}

/**
 * Іконки дій шару 2 (від 768px): кабінет, обране, порівняння, кошик — порядок референсу.
 * Тема й мова живуть у шарі 1 (006), тут їх більше немає; окремого приховування 1024–1279px
 * теж немає — весь шар 2 ховається/показується разом як один блок (див. Header()).
 */
function Actions() {
  const { locale, dict } = useI18n();
  const mounted = useMounted();
  const compareCount = useCompare((state) => state.slugs.length);
  const wishCount = useWishlist((state) => state.slugs.length);
  const pathname = usePathname();

  return (
    <>
      <IconLink to={href(locale, "/account")} label={dict.nav.account} current={pathname.endsWith("/account")}>
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
    </>
  );
}

function IconLink({
  to,
  label,
  count = 0,
  current,
  children,
}: {
  to: string;
  label: string;
  count?: number;
  current?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={to}
      aria-label={count > 0 ? `${label}, ${count}` : label}
      aria-current={current ? "page" : undefined}
      className={`relative grid h-[52px] w-[52px] place-items-center rounded-full transition-colors ${
        current ? "text-signal-text" : "text-bone hover:text-signal-text"
      }`}
    >
      {children}
      {count > 0 ? (
        <span className="t-num absolute right-1 top-1.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-signal px-1 text-[11px] font-semibold text-black">
          {count}
        </span>
      ) : null}
    </Link>
  );
}

/**
 * Пілюля мови в шарі 1 (006): показує ПОТОЧНУ локаль («Укр»/«Рус»), як у референсі, клік
 * перемикає на іншу — повноцінного випадного списку не робимо, локалей усього дві, зайва
 * складність. Без шеврона (review 006 #2): він натякав на випадне меню, якого немає — клік
 * одразу перемикає мову. Без іконки глобуса теж: сам напис локалі вже достатньо зрозумілий.
 * Обычная ссылка, не <Link>: смена локали меняет корневой layout, клиентская
 * перерисовка задела бы <script> темы в <head> (ошибка React 19 в консоли). Полная загрузка дешевле.
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

export function SearchBox({
  className,
  defaultValue = "",
  autoFocus,
}: {
  className: string;
  defaultValue?: string;
  autoFocus?: boolean;
}) {
  const { locale, dict } = useI18n();
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const [focused, setFocused] = useState(false);
  const box = useRef<HTMLFormElement>(null);

  const matches = value.trim().length > 1 ? searchHints(value) : [];

  // Печатающийся плейсхолдер работает, только когда поле пустое и не в фокусе, и выключен
  // при prefers-reduced-motion (тогда useTypedPlaceholder вернёт null). Префикс "Шукати: "
  // держит текст читаемым даже на промежуточных кадрах набора/удаления ("Шукати: R").
  const typingQueries = useMemo(() => typewriterQueries(locale), [locale]);
  const typedPlaceholder = useTypedPlaceholder(typingQueries, value.trim().length === 0 && !focused);
  const placeholder =
    typedPlaceholder !== null ? `${dict.nav.searchTypingPrefix}${typedPlaceholder}` : dict.nav.searchPlaceholder;

  return (
    <form
      ref={box}
      onSubmit={(event) => {
        event.preventDefault();
        if (!value.trim()) return;
        router.push(`${href(locale, "/search")}?q=${encodeURIComponent(value.trim())}`);
        setFocused(false);
      }}
      className={className}
      role="search"
    >
      <div
        className={`flex h-[52px] items-center rounded-full border pl-5 pr-1.5 transition-colors ${
          focused ? "border-signal" : "border-[var(--hair-strong)]"
        }`}
      >
        <input
          type="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => window.setTimeout(() => setFocused(false), 150)}
          placeholder={placeholder}
          aria-label={dict.nav.search}
          autoFocus={autoFocus}
          className="h-full min-w-0 flex-1 bg-transparent text-base text-bone outline-none placeholder:text-bone-faint"
        />
        <button type="submit" aria-label={dict.nav.searchSubmit} className="icon-btn">
          <IconSearch className="h-5 w-5" />
        </button>
      </div>

      {focused && matches.length > 0 ? (
        <div className="absolute inset-x-0 top-[calc(100%+8px)] z-10 overflow-hidden rounded-[24px] border border-[var(--hair-strong)] bg-ink-850 py-2 shadow-[var(--shadow-pop)]">
          {matches.map((product) => (
            <Link
              key={product.slug}
              href={productHref(locale, product.slug)}
              className="flex items-center gap-3 px-4 py-2 transition-colors hover:bg-ink-700"
            >
              <Image src={imageOf(product)} alt="" width={44} height={44} className="h-11 w-11 object-contain" />
              <span className="min-w-0 flex-1 truncate text-[15px] text-bone">
                {brandName(product.brand)} {product.model}
              </span>
              <span className="t-num shrink-0 text-[15px] text-bone-dim">{price(product.price)} ₴</span>
            </Link>
          ))}
        </div>
      ) : null}
    </form>
  );
}

function searchHints(value: string) {
  const needle = value.trim().toLowerCase();
  return bestsellers(60)
    .filter((product) => `${product.brand} ${product.model}`.toLowerCase().includes(needle))
    .slice(0, 5);
}

function brandName(slug: string) {
  return brands.find((brand) => brand.slug === slug)?.name ?? slug;
}

/** 4–5 реальных запросов для печатающегося плейсхолдера: бестселлеры + одна категория. */
function typewriterQueries(locale: Locale): string[] {
  const productQueries = bestsellers(4).map((product) => `${brandName(product.brand)} ${product.model}`);
  const categoryQuery = categories[0]?.name[locale];
  return categoryQuery ? [...productQueries, categoryQuery] : productQueries;
}

function subscribeReducedMotion(callback: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

/** true, если система просит убрать анимацию. На сервере считаем «да», чтобы не мигать. */
function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => true,
  );
}

/**
 * Печатает и стирает слова по буквам в плейсхолдере поиска. Активен только когда `active`
 * true; при prefers-reduced-motion или неактивности возвращает null — вызывающий код тогда
 * показывает статичный текст. Значение из состояния отдаём только пока активны: сброс не
 * делаем через setState в эффекте, чтобы не гонять лишний рендер.
 */
function useTypedPlaceholder(words: string[], active: boolean): string | null {
  const [text, setText] = useState("");
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!active || reduced || words.length === 0) return;

    let wordIndex = 0;
    let charIndex = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      const word = words[wordIndex];
      if (!deleting) {
        charIndex += 1;
        setText(word.slice(0, charIndex));
        const done = charIndex === word.length;
        deleting = done;
        timer = setTimeout(tick, done ? 1700 : 65);
        return;
      }
      charIndex -= 1;
      setText(word.slice(0, charIndex));
      if (charIndex === 0) {
        deleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        timer = setTimeout(tick, 350);
        return;
      }
      timer = setTimeout(tick, 30);
    };

    timer = setTimeout(tick, 600);
    return () => clearTimeout(timer);
  }, [active, reduced, words]);

  // Пустая строка между словами не отдаём: вызывающий код тогда покажет статичный текст
  // целиком, а не голый префикс "Шукати: " (обзор round 2, #17).
  return active && !reduced && text.length > 0 ? text : null;
}

function MegaMenu({ onClose }: { onClose: () => void }) {
  const { locale, dict } = useI18n();

  return (
    <>
      <div className="fixed inset-0 top-[var(--header-h)] bg-ink-900/70" onClick={onClose} aria-hidden />
      <div className="absolute inset-x-0 top-full border-b border-[var(--hair)] bg-ink-900">
        <div className="shell grid gap-16 py-10 lg:grid-cols-[1.7fr_1fr]">
          <div className="grid gap-x-10 sm:grid-cols-2">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={categoryHref(locale, category.slug)}
                className="group flex items-center gap-5 border-t border-[var(--hair)] py-4"
              >
                <span className="relative h-16 w-16 shrink-0">
                  <Image
                    src={categoryIcon(category.slug)}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-contain transition-transform duration-500 group-hover:scale-105"
                  />
                </span>
                <span>
                  <span className="block text-[18px] font-medium text-bone transition-colors group-hover:text-signal-text">
                    {category.name[locale]}
                  </span>
                  <span className="mt-0.5 block text-sm text-bone-dim">{category.blurb[locale]}</span>
                </span>
              </Link>
            ))}
          </div>

          <div>
            <p className="t-eyebrow text-bone-dim">{dict.catalog.platform}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {platforms.map((platform) => (
                <Link
                  key={platform.slug}
                  href={`${href(locale, "/catalog")}?platform=${platform.slug}`}
                  className="chip"
                >
                  {platform.name}
                  <span className="text-bone-dim">{countForPlatform(platform.slug)}</span>
                </Link>
              ))}
            </div>

            <p className="t-eyebrow mt-9 text-bone-dim">{dict.nav.brands}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {brands.map((brand) => (
                <Link key={brand.slug} href={`${href(locale, "/catalog")}?brand=${brand.slug}`} className="chip">
                  {brand.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
        {/* Місто/підтримка/кабінет/тема тут більше не дублюються (006): MegaMenu відкривається
            тільки від lg (1024px), де шар 1 і кабінет у шарі 2 вже завжди на екрані. */}
      </div>
    </>
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
              <Image src={categoryIcon(category.slug)} alt="" fill sizes="56px" className="object-contain" />
            </span>
            <span className="flex-1 text-[18px] font-medium text-bone">{category.name[locale]}</span>
            <span className="text-[15px] text-bone-dim">{countIn(category.slug)}</span>
          </Link>
        ))}

        {/* City/support/wishlist/compare/theme/language дублюють шар 1 і Actions шару 2 від
            md (768px) — там вони вже на екрані (review 006 #1). Нижче md їх у шапці немає
            (окремий мобільний каркас без каталогу/міста/мови), тому тут лишаються тільки
            для <768. Account не потрапляє сюди взагалі: він завжди видний у шапці — у
            мобільному рядку 1 (<768) і в Actions шару 2 (≥768). */}
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
          {/* Полная загрузка, как в LangSwitch. */}
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
