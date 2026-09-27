import Link from "next/link";
import { IconChevron } from "@/components/ui/icons";

/**
 * Постраничная навигация: десктоп, ссылки — работает без JS, «назад» тоже.
 * Без `scroll={false}` — переход должен поднимать страницу вверх, а не оставлять на прежней
 * позиции скролла (иначе после клика по «2» видно только хвост старой страницы).
 */
export function Pagination({
  page,
  totalPages,
  buildHref,
  prevLabel,
  nextLabel,
  navLabel,
  pageLabel,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
  prevLabel: string;
  nextLabel: string;
  navLabel: string;
  pageLabel: (n: number) => string;
}) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav aria-label={navLabel} className="mt-10 hidden items-center justify-center gap-1.5 lg:flex">
      <Link
        href={buildHref(Math.max(1, page - 1))}
        aria-label={prevLabel}
        aria-disabled={page === 1}
        tabIndex={page === 1 ? -1 : 0}
        className={`icon-btn ${page === 1 ? "pointer-events-none opacity-30" : ""}`}
      >
        <IconChevron className="h-4 w-4 rotate-180" />
      </Link>
      {pages.map((n) => (
        <Link
          key={n}
          href={buildHref(n)}
          aria-current={n === page ? "page" : undefined}
          aria-label={pageLabel(n)}
          className={`grid h-11 w-11 place-items-center rounded-full text-[15px] transition-colors ${
            n === page ? "bg-signal text-black" : "text-bone-dim hover:text-bone"
          }`}
        >
          {n}
        </Link>
      ))}
      <Link
        href={buildHref(Math.min(totalPages, page + 1))}
        aria-label={nextLabel}
        aria-disabled={page === totalPages}
        tabIndex={page === totalPages ? -1 : 0}
        className={`icon-btn ${page === totalPages ? "pointer-events-none opacity-30" : ""}`}
      >
        <IconChevron className="h-4 w-4" />
      </Link>
    </nav>
  );
}

/** Мобильная замена постраничной навигации: дописывает следующую порцию в тот же список. */
export function LoadMore({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} scroll={false} className="ghost-btn mt-8 w-full lg:hidden">
      {label}
    </Link>
  );
}
