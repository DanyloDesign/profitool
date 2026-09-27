import Link from "next/link";
import type { Product } from "@/data/types";
import { ProductCard } from "./product-card";
import { IconArrow } from "@/components/ui/icons";

type Props = {
  title: string;
  note?: string;
  items: Product[];
  action?: { href: string; label: string; outline?: boolean };
  size?: "home" | "catalog" | "rail";
  /** Заголовок секции главной или подзаголовок страницы. */
  level?: "section" | "sub";
};

/** Блок товаров: заголовок, ссылка «дивитись усе» и сетка карточек 2 → 4 колонки. */
export function ProductSection({ title, note, items, action, size = "home", level = "section" }: Props) {
  return (
    <section>
      <div className="flex items-end justify-between gap-6">
        <div>
          <h2 className={level === "section" ? "t-section text-bone" : "t-h2 text-bone"}>{title}</h2>
          {note ? <p className="mt-2.5 text-base text-bone-dim">{note}</p> : null}
        </div>

        {action ? (
          <Link
            href={action.href}
            className={
              action.outline
                ? "ghost-btn btn-sm hidden shrink-0 sm:inline-flex"
                : "hidden shrink-0 text-base text-bone-dim transition-colors hover:text-signal-text sm:block"
            }
          >
            {action.label}
            {action.outline ? <IconArrow className="h-4 w-4" /> : null}
          </Link>
        ) : null}
      </div>

      <div className="mt-7 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-10 md:gap-y-12">
        {items.map((product) => (
          <ProductCard key={product.slug} product={product} size={size} />
        ))}
      </div>
    </section>
  );
}
