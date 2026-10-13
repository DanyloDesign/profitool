import Link from "next/link";
import type { Product } from "@/data/types";
import { ProductCard } from "./product-card";
import { IconArrow } from "@/components/ui/icons";

type Action = { href: string; label: string };

type Props = {
  title: string;
  note?: string;
  items: Product[];
  action?: Action;
  size?: "home" | "catalog" | "rail";
  /** Заголовок секции главной или подзаголовок страницы. */
  level?: "section" | "sub";
};

/**
 * 015: a section's "see all" link, one outline pill everywhere. From 640px it sits top-right next
 * to the heading; on phones the same link goes full width under the grid (`placement="below"`).
 */
export function SectionAction({ action, placement }: { action: Action; placement: "head" | "below" }) {
  return (
    <Link
      href={action.href}
      className={
        placement === "head"
          ? "ghost-btn btn-sm hidden shrink-0 sm:inline-flex"
          : "ghost-btn mt-8 flex w-full sm:hidden"
      }
    >
      {action.label}
      <IconArrow className="h-4 w-4" strokeWidth={2} />
    </Link>
  );
}

/** Блок товаров: заголовок, ссылка «дивитись усе» и сетка карточек 2 → 4 колонки. */
export function ProductSection({ title, note, items, action, size = "home", level = "section" }: Props) {
  return (
    <section>
      <div className="flex items-end justify-between gap-6">
        <div>
          <h2 className={level === "section" ? "t-section text-bone" : "t-h2 text-bone"}>{title}</h2>
          {note ? <p className="mt-2.5 text-base text-bone-dim">{note}</p> : null}
        </div>

        {action ? <SectionAction action={action} placement="head" /> : null}
      </div>

      <div className="mt-7 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-10 md:gap-y-12">
        {items.map((product) => (
          <ProductCard key={product.slug} product={product} size={size} />
        ))}
      </div>

      {action ? <SectionAction action={action} placement="below" /> : null}
    </section>
  );
}
