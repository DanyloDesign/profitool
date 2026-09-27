import Link from "next/link";
import Image from "next/image";
import { asset } from "@/lib/asset";

/**
 * Знак и слово. Рисунок знака не трогаем: молоток и зубило выбиты в заливке,
 * на чёрном фоне они читаются тёмными. Мельче 32px знак не ставить.
 */
/** compact — для верхнего ряда шапки высотой 48px: знак 32px, слово мельче. */
export function Logo({ href, className = "", compact = false }: { href: string; className?: string; compact?: boolean }) {
  return (
    <Link href={href} className={`flex shrink-0 items-center gap-2.5 sm:gap-3 ${className}`}>
      <Image
        src={asset("/brand/logo.svg")}
        alt=""
        width={44}
        height={44}
        unoptimized
        priority
        className={compact ? "h-8 w-8" : "h-[34px] w-[34px] sm:h-11 sm:w-11"}
      />
      <span
        className={`font-display font-semibold leading-none tracking-[-0.01em] text-bone ${compact ? "text-xl" : "text-[19px] sm:text-2xl"}`}
      >
        Profitool
      </span>
    </Link>
  );
}
