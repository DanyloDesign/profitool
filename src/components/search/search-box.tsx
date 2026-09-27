"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useI18n } from "@/i18n/context";
import { brandBySlug } from "@/data/taxonomy";
import { categoryPhoto, href, imageOf, keyValue, price } from "@/lib/shop";
import { IconArrow, IconClose, IconSearch } from "@/components/ui/icons";
import { searchModel, type SearchGroup, type SearchOption } from "./search-model";
import { useTypedPlaceholder } from "./use-typed-placeholder";

export type SearchBoxProps = {
  className?: string;
  /** "bar": the header field from 768px, the panel drops under it (≥1024) or across the page.
   *  "phone": the panel covers the page below the header. */
  variant: "bar" | "phone";
  defaultValue?: string;
  /** Called when the panel opens, so the header can close its menus. */
  onOpen?: () => void;
};

const optionId = (base: string, index: number) => `${base}-o${index}`;

/**
 * Header search: an open field with a suggestions panel (015, pattern 3). Combobox ARIA: the input
 * owns a listbox, ↑↓ move the active option (aria-activedescendant), Enter opens it or submits the
 * query to /search, Esc closes. The panel keeps focus in the input: pressing an option does not
 * take focus away (mousedown is prevented), so a query chip fills the field and the panel answers
 * at once. Leaving the field (Tab, a click outside, the scrim) closes the panel; a route change
 * remounts the box (see HeaderSearch), which closes it too.
 */
export function SearchBox({ className = "", variant, defaultValue = "", onOpen }: SearchBoxProps) {
  const { locale, dict } = useI18n();
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const baseId = useId();
  const listId = `${baseId}-list`;

  const model = useMemo(() => searchModel(value, locale, dict.header.popular), [value, locale, dict]);
  const options = useMemo(() => model.groups.flatMap((group) => group.options), [model]);
  const activeIndex = active < options.length ? active : -1;

  // The placeholder types real queries only while nobody is using the field.
  const typed = useTypedPlaceholder(dict.header.typing, !focused && value.length === 0);
  const placeholder = typed !== null ? `${dict.nav.searchTypingPrefix}${typed}` : dict.header.placeholder;

  useEffect(() => {
    if (!open || activeIndex < 0) return;
    document.getElementById(optionId(baseId, activeIndex))?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex, baseId]);

  const show = () => {
    if (open) return;
    setOpen(true);
    onOpen?.();
  };

  const close = () => {
    setOpen(false);
    setActive(-1);
  };

  const fill = (text: string) => {
    setValue(text);
    setActive(-1);
    setOpen(true);
    inputRef.current?.focus();
  };

  const go = (target: string) => {
    close();
    inputRef.current?.blur();
    router.push(target);
  };

  const submit = () => {
    const query = value.trim();
    if (!query) {
      inputRef.current?.focus();
      show();
      return;
    }
    go(`${href(locale, "/search")}?q=${encodeURIComponent(query)}`);
  };

  const choose = (option: SearchOption) => {
    if (option.kind === "query") fill(option.text);
    else go(option.href);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        show();
        return;
      }
      if (!options.length) return;
      const step = event.key === "ArrowDown" ? 1 : -1;
      const next =
        activeIndex < 0 ? (step > 0 ? 0 : options.length - 1) : (activeIndex + step + options.length) % options.length;
      setActive(next);
      return;
    }
    if (event.key === "Escape" && open) {
      event.preventDefault();
      close();
      return;
    }
    if (event.key === "Enter" && open && activeIndex >= 0) {
      event.preventDefault();
      choose(options[activeIndex]);
    }
  };

  // Options are numbered across the groups in drawing order: each group starts where the last ended.
  const starts = model.groups.map((_, groupIndex) =>
    model.groups.slice(0, groupIndex).reduce((sum, group) => sum + group.options.length, 0),
  );
  const inSection = model.productsIn?.name[locale];
  const groupTitle = (group: SearchGroup): string | undefined => {
    if (group.id === "popular") return dict.header.popularTitle;
    if (group.id === "sections") return dict.header.sectionsTitle;
    if (group.id === "products") return inSection ? dict.header.inSection(inSection) : dict.header.productsTitle;
    return undefined;
  };

  return (
    <form
      role="search"
      className={`relative ${className}`}
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      onBlur={(event) => {
        // Focus moving between the field and the clear button stays inside; anything else closes.
        if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
        setFocused(false);
        close();
      }}
    >
      <div
        className={`flex h-12 items-center rounded-full border bg-ink-900 transition-colors duration-[var(--dur-fast)] ${
          open || focused ? "border-bone" : "border-[var(--hair-strong)] hover:border-bone-dim"
        }`}
      >
        <button
          type="submit"
          tabIndex={-1}
          aria-label={dict.nav.searchSubmit}
          className="ml-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-full text-bone-dim transition-colors hover:text-bone"
        >
          <IconSearch className="h-5 w-5" />
        </button>
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-label={dict.nav.search}
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-autocomplete="list"
          aria-activedescendant={open && activeIndex >= 0 ? optionId(baseId, activeIndex) : undefined}
          autoComplete="off"
          enterKeyHint="search"
          value={value}
          placeholder={placeholder}
          onChange={(event) => {
            setValue(event.target.value);
            setActive(-1);
            show();
          }}
          onFocus={() => {
            setFocused(true);
            show();
          }}
          onMouseDown={show}
          onKeyDown={onKeyDown}
          className="h-full min-w-0 flex-1 bg-transparent pr-3 text-base text-bone outline-none placeholder:text-bone-faint [&::-webkit-search-cancel-button]:hidden"
        />
        {value ? (
          <button
            type="button"
            aria-label={dict.header.clear}
            onClick={() => fill("")}
            className="mr-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-full text-bone-dim transition-colors hover:text-bone"
          >
            <IconClose className="h-[18px] w-[18px]" />
          </button>
        ) : open && variant === "phone" ? (
          // On a phone the panel covers the page, so an empty field gets a way out.
          <button
            type="button"
            aria-label={dict.nav.close}
            onClick={() => {
              close();
              setFocused(false);
              inputRef.current?.blur();
            }}
            className="mr-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-full text-bone-dim transition-colors hover:text-bone"
          >
            <IconClose className="h-[18px] w-[18px]" />
          </button>
        ) : null}
      </div>

      {open ? (
        <>
          {variant === "bar" ? <div aria-hidden className="hdr-scrim" onClick={close} /> : null}
          <div
            className="hdr-panel"
            data-variant={variant}
            // Keep focus in the input while an option is pressed.
            onMouseDown={(event) => event.preventDefault()}
          >
            {model.mode === "none" ? (
              <p className="px-3 pt-1 text-base text-bone">{dict.header.noResults(value.trim())}</p>
            ) : null}
            <div role="listbox" id={listId} aria-label={dict.header.suggestions} className="grid gap-4">
              {model.groups.map((group, groupIndex) => (
                <PanelGroup
                  key={group.id}
                  group={group}
                  first={starts[groupIndex]}
                  baseId={baseId}
                  activeIndex={activeIndex}
                  title={groupTitle(group)}
                  onChoose={choose}
                  onFollow={close}
                />
              ))}
            </div>
            {variant === "bar" ? (
              <p aria-hidden className="flex flex-wrap gap-x-[18px] border-t border-[var(--hair)] px-3 pt-3 text-sm text-bone-faint">
                <span>{dict.header.keyMove}</span>
                <span>{dict.header.keyOpen}</span>
                <span>{dict.header.keyClose}</span>
              </p>
            ) : null}
          </div>
        </>
      ) : null}
    </form>
  );
}

function PanelGroup({
  group,
  first,
  baseId,
  activeIndex,
  title,
  onChoose,
  onFollow,
}: {
  group: SearchGroup;
  first: number;
  baseId: string;
  activeIndex: number;
  title?: string;
  onChoose: (option: SearchOption) => void;
  onFollow: () => void;
}) {
  const { locale, dict } = useI18n();
  const titleId = `${baseId}-${group.id}`;

  const items = group.options.map((option, offset) => {
    const index = first + offset;
    const common = {
      id: optionId(baseId, index),
      role: "option" as const,
      "aria-selected": index === activeIndex,
      "data-active": index === activeIndex ? "" : undefined,
      tabIndex: -1,
    };

    if (option.kind === "query" && group.id === "popular") {
      return (
        <button key={option.text} type="button" {...common} onClick={() => onChoose(option)} className="hdr-chip">
          {option.text}
        </button>
      );
    }

    if (option.kind === "query") {
      return (
        <button key={option.text} type="button" {...common} onClick={() => onChoose(option)} className="hdr-row h-11">
          <IconSearch className="h-4 w-4 shrink-0 text-bone-faint" />
          <span className="min-w-0 truncate">
            {option.head}
            <strong className="font-semibold">{option.tail}</strong>
          </span>
        </button>
      );
    }

    if (option.kind === "section" && group.id === "sections") {
      return (
        <Link key={option.category.slug} href={option.href} {...common} onClick={onFollow} className="hdr-row h-14">
          <Image src={categoryPhoto(option.category.slug)} alt="" width={40} height={40} className="h-10 w-10 shrink-0 object-contain" />
          <span className="min-w-0 truncate">{option.category.name[locale]}</span>
        </Link>
      );
    }

    if (option.kind === "section") {
      return (
        <Link key={option.category.slug} href={option.href} {...common} onClick={onFollow} className="hdr-row h-[60px]">
          <Image src={categoryPhoto(option.category.slug)} alt="" width={44} height={44} className="h-11 w-11 shrink-0 object-contain" />
          <span className="grid min-w-0 flex-1 leading-tight">
            <span className="truncate font-semibold">{option.category.name[locale]}</span>
            <span className="mt-0.5 text-sm text-bone-dim">{dict.header.sectionNote}</span>
          </span>
          <IconArrow className="h-[18px] w-[18px] shrink-0 text-bone-dim" />
        </Link>
      );
    }

    const { product } = option;
    return (
      <Link key={product.slug} href={option.href} {...common} onClick={onFollow} className="hdr-row h-16">
        <Image src={imageOf(product)} alt="" width={48} height={48} className="h-12 w-12 shrink-0 object-contain" />
        <span className="grid min-w-0 flex-1 leading-tight">
          <span className="truncate font-medium">
            {brandBySlug.get(product.brand)?.name ?? product.brand} {product.model}
          </span>
          <span className="mt-0.5 truncate text-sm text-bone-dim">{keyValue(product, locale)}</span>
        </span>
        <span className="t-price shrink-0 text-base text-bone">{price(product.price)} ₴</span>
      </Link>
    );
  });

  const layout =
    group.id === "popular"
      ? "flex flex-wrap gap-2 px-3"
      : group.id === "sections"
        ? "grid gap-x-4 gap-y-1 sm:grid-cols-2"
        : "grid";

  return (
    <div
      role="group"
      aria-labelledby={title ? titleId : undefined}
      aria-label={title ? undefined : group.id === "completions" ? dict.header.suggestions : dict.header.sectionsTitle}
      className={`grid gap-2 ${group.id === "products" && first > 0 ? "border-t border-[var(--hair)] pt-3" : ""}`}
    >
      {title ? (
        <p id={titleId} className="px-3 text-sm text-bone-dim">
          {title}
        </p>
      ) : null}
      <div className={layout}>{items}</div>
    </div>
  );
}
