"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, ShoppingCart, SlidersHorizontal } from "lucide-react";
import { Product } from "@/lib/types";
import { discountPercent, money } from "@/lib/format";
import { useCart } from "@/components/cart";
import { ProductImage } from "@/components/product-image";

/** Kart görselleri küçük boyutta yüklenir; büyük görsel yalnızca ürün detayındadır. */
const CARD_IMAGE_SIZE = 320;
const CARD_SIZES = "(min-width: 1280px) 220px, (min-width: 640px) 260px, 45vw";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  const hasVariants = product.variants.length > 0;
  const variantFloor = hasVariants
    ? Math.min(...product.variants.map((variant) => variant.price))
    : null;
  const price = variantFloor ?? product.salePrice ?? product.price;
  const oldPrice = !hasVariants && product.salePrice ? product.price : null;
  const discount = oldPrice ? discountPercent(product.price, product.salePrice) : null;
  const badge = product.isNew ? "Yeni" : product.isBestSeller ? "Çok Satan" : null;
  const meta = product.weight || (hasVariants ? `${product.variants.length} seçenek` : product.unit);

  function addToCart() {
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.mainImage,
      variantId: null,
      variantLabel: null,
      unitPrice: price,
      quantity: 1,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  }

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-[14px] border border-line bg-white transition hover:shadow-[var(--shadow-card-hover)]">
      <Link
        href={`/product/${product.slug}`}
        className="relative block bg-brand-soft"
        tabIndex={-1}
      >
        <span className="block aspect-square w-full p-3">
          <ProductImage
            src={product.mainImage}
            alt=""
            width={CARD_IMAGE_SIZE}
            height={CARD_IMAGE_SIZE}
            sizes={CARD_SIZES}
            className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.03]"
          />
        </span>

        {discount && (
          <span className="absolute left-2 top-2 rounded-full bg-brand px-2 py-1 text-[10px] font-bold text-white">
            %{discount}
          </span>
        )}
        {!discount && badge && (
          <span className="absolute left-2 top-2 rounded-full bg-white px-2 py-1 text-[10px] font-bold text-brand shadow-sm">
            {badge}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <Link
          href={`/product/${product.slug}`}
          className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-ink transition hover:text-brand"
        >
          {product.name}
        </Link>

        <p className="mt-1 text-xs text-muted">{meta}</p>

        <div className="mt-auto pt-3">
          <div className="flex items-baseline gap-2">
            <strong className="text-base font-extrabold text-ink">
              {hasVariants && (
                <span className="text-xs font-semibold text-muted">Başlangıç </span>
              )}
              {money(price)}
            </strong>
            {oldPrice && <s className="text-xs text-muted">{money(oldPrice)}</s>}
          </div>

          {hasVariants ? (
            <Link
              href={`/product/${product.slug}`}
              className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-full border border-brand text-xs font-bold text-brand transition hover:bg-brand hover:text-white"
            >
              <SlidersHorizontal size={14} />
              Seçenekleri Gör
            </Link>
          ) : (
            <button
              type="button"
              onClick={addToCart}
              aria-label={`${product.name} ürününü sepete ekle`}
              className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-full border border-brand text-xs font-bold text-brand transition hover:bg-brand hover:text-white"
            >
              {added ? <Check size={15} /> : <ShoppingCart size={14} />}
              {added ? "Sepete Eklendi" : "Sepete Ekle"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
