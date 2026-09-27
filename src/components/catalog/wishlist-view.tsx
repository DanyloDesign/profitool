"use client";

import { useMounted } from "@/lib/use-mounted";
import { useI18n } from "@/i18n/context";
import { productBySlug } from "@/data/products";
import type { Product } from "@/data/types";
import { href } from "@/lib/shop";
import { useWishlist } from "@/store/shop";
import { ProductCard } from "@/components/catalog/product-card";
import { EmptyState } from "@/components/ui/empty-state";
import { IconHeart } from "@/components/ui/icons";

export function WishlistView() {
  const { locale, dict } = useI18n();
  const mounted = useMounted();
  const slugs = useWishlist((state) => state.slugs);

  if (!mounted) return <div className="min-h-[40vh]" role="status" aria-busy="true" />;

  const items = slugs.map((slug) => productBySlug.get(slug)).filter((p): p is Product => p !== undefined);

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<IconHeart className="h-12 w-12" strokeWidth={1.2} />}
        title={dict.wishlist.empty}
        text={dict.wishlist.emptyText}
        cta={{ href: href(locale, "/catalog"), label: dict.catalog.all }}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-10 md:gap-y-12 lg:grid-cols-4">
      {items.map((product) => (
        <ProductCard key={product.slug} product={product} size="home" />
      ))}
    </div>
  );
}
