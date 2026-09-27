import Link from "next/link";

export type Crumb = { label: string; href?: string };

/** Хлебные крошки: последний пункт без ссылки, это текущая страница. */
export function Breadcrumbs({ items, label }: { items: Crumb[]; label: string }) {
  return (
    <nav aria-label={label} className="text-sm text-bone-dim">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {index > 0 ? <span aria-hidden>·</span> : null}
              {item.href && !last ? (
                <Link href={item.href} className="transition-colors hover:text-signal-text">
                  {item.label}
                </Link>
              ) : (
                <span className={last ? "text-bone" : undefined} aria-current={last ? "page" : undefined}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
