import Link from "next/link";

/** Пустой экран: значок, заголовок, одна фраза и один выход. Без панелей и рамок. */
export function EmptyState({
  icon,
  title,
  text,
  cta,
}: {
  icon: React.ReactNode;
  title: string;
  text?: string;
  cta?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-col items-center border-t border-[var(--hair)] px-2 py-20 text-center md:py-28">
      <span className="text-bone-faint">{icon}</span>
      <p className="t-h2 mt-6 text-bone">{title}</p>
      {text ? <p className="mt-3 max-w-md text-base text-bone-dim">{text}</p> : null}
      {cta ? (
        <Link href={cta.href} className="signal-btn mt-8">
          {cta.label}
        </Link>
      ) : null}
    </div>
  );
}
