import Link from "next/link";
import Image from "next/image";

/**
 * Знак и слово. Рисунок знака не трогаем: молоток и зубило выбиты в заливке,
 * на чёрном фоне они читаются тёмными. Мельче 32px знак не ставить.
 */
export function Logo({ href, className = "" }: { href: string; className?: string }) {
  return (
    <Link href={href} className={`flex shrink-0 items-center gap-2.5 sm:gap-3 ${className}`}>
      <Image
        src="/brand/logo.svg"
        alt=""
        width={44}
        height={44}
        unoptimized
        priority
        className="h-[34px] w-[34px] sm:h-11 sm:w-11"
      />
      <span className="font-display text-[19px] font-semibold leading-none tracking-[-0.01em] text-bone sm:text-2xl">
        Profitool
      </span>
    </Link>
  );
}
