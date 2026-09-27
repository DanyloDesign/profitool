import Link from "next/link";
import Image from "next/image";
import { asset } from "@/lib/asset";

/**
 * Знак и слово. Рисунок знака не трогаем: молоток и зубило выбиты в заливке,
 * на чёрном фоне они читаются тёмными. Мельче 32px знак не ставить.
 *
 * variant:
 * - "default": footer and the phone header (mark 34/44px, word 19/24px);
 * - "bar": the header from 768px (015). Mark 32px, word 18px. At 1024–1279px the one-row header
 *   has no room for the word, so only the mark stays; the link keeps its name through aria-label.
 */
export function Logo({
  href,
  className = "",
  variant = "default",
}: {
  href: string;
  className?: string;
  variant?: "default" | "bar";
}) {
  const bar = variant === "bar";
  return (
    <Link
      href={href}
      aria-label="Profitool"
      className={`flex shrink-0 items-center ${bar ? "gap-2.5" : "gap-2.5 sm:gap-3"} ${className}`}
    >
      <Image
        src={asset("/brand/logo.svg")}
        alt=""
        width={44}
        height={44}
        unoptimized
        priority
        className={bar ? "h-8 w-8" : "h-[34px] w-[34px] sm:h-11 sm:w-11"}
      />
      <span
        className={`font-display font-semibold leading-none tracking-[-0.01em] text-bone ${
          bar ? "text-[18px] lg:hidden xl:inline" : "text-[19px] sm:text-2xl"
        }`}
      >
        Profitool
      </span>
    </Link>
  );
}
