"use client";

import Image from "next/image";
import { useMounted } from "@/lib/use-mounted";
import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useI18n } from "@/i18n/context";
import { productBySlug } from "@/data/products";
import { href, imageOf } from "@/lib/shop";
import { setBodyInset } from "@/lib/body-inset";
import { useCompare } from "@/store/shop";
import { IconArrow } from "@/components/ui/icons";

/** Липкая панель сравнения: видно выбор, не уходя из листинга. */
export function CompareBar() {
  const { locale, dict } = useI18n();
  const mounted = useMounted();
  const slugs = useCompare((state) => state.slugs);
  const clear = useCompare((state) => state.clear);
  const pathname = usePathname();

  const visible = mounted && slugs.length > 0 && !pathname.endsWith("/compare");

  // Панель закреплена внизу окна: пока она есть, оставляем под ней место, чтобы не закрывать подвал.
  useEffect(() => {
    if (!visible) return;
    setBodyInset("compare-bar", 84);
    return () => setBodyInset("compare-bar", 0);
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--hair-strong)] bg-ink-900/95 backdrop-blur-xl">
      <div className="shell flex items-center gap-4 py-3 sm:gap-6">
        <span className="hidden shrink-0 text-[15px] text-bone-dim sm:block">{dict.compare.bar(slugs.length)}</span>

        <div className="flex flex-1 items-center gap-2 overflow-x-auto">
          {slugs.map((slug) => {
            const product = productBySlug.get(slug);
            if (!product) return null;
            return (
              <span key={slug} className="relative h-14 w-14 shrink-0">
                <Image src={imageOf(product)} alt={product.model} fill sizes="56px" className="object-contain" />
              </span>
            );
          })}
        </div>

        <button type="button" onClick={clear} className="hidden h-11 shrink-0 px-2 text-[15px] text-bone-dim hover:text-bone sm:block">
          {dict.compare.clear}
        </button>

        <Link href={href(locale, "/compare")} className="signal-btn btn-sm shrink-0">
          {dict.compare.open}
          <IconArrow className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
