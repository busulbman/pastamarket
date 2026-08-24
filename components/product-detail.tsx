"use client";

import { useState } from "react";
import { Check, Minus, Plus, ShoppingCart, Truck } from "lucide-react";
import { Product } from "@/lib/types";
import { discountPercent, money } from "@/lib/format";
import { ProductImage } from "@/components/product-image";
import { useCart } from "@/components/cart";
import { productCardImageUrl, productDetailImageUrl } from "@/lib/image-url";

export function ProductDetail({
  product,
  cutoff,
}: {
  product: Product;
  cutoff: string;
}) {
  const { add } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<number | null>(
    product.variants.length === 1 ? product.variants[0].id : null,
  );
  const [quantity, setQuantity] = useState(1);
  const [image, setImage] = useState(product.mainImage);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);

  const variant = product.variants.find((item) => item.id === selectedVariant);
  const price = variant?.price ?? product.salePrice ?? product.price;
  const oldPrice = !variant && product.salePrice ? product.price : null;
  const discount = oldPrice ? discountPercent(product.price, product.salePrice) : null;
  const gallery = [product.mainImage, ...product.images].filter(
    (src, index, all) => src && all.indexOf(src) === index,
  );

  function addToCart() {
    if (product.variants.length && !variant) {
      setError("Sepete eklemek için bir seçenek belirleyin.");
      return;
    }
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image,
      variantId: variant?.id ?? null,
      variantLabel: variant ? `${variant.name}: ${variant.optionLabel}` : null,
      unitPrice: price,
      quantity,
    });
    setError("");
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
      <div>
        <div className="overflow-hidden rounded-2xl bg-brand-soft">
          <ProductImage
            src={productDetailImageUrl(image)}
            alt={product.name}
            width={800}
            height={800}
            sizes="(min-width: 768px) 520px, 92vw"
            priority
            className="aspect-square w-full object-contain p-6"
          />
        </div>

        {gallery.length > 1 && (
          <div className="mt-3 flex gap-2">
            {gallery.map((src) => (
              <button
                key={src}
                type="button"
                onClick={() => setImage(src)}
                aria-label="Ürün görselini değiştir"
                aria-pressed={image === src}
                className={`h-16 w-16 overflow-hidden rounded-xl border bg-brand-soft ${
                  image === src ? "border-brand" : "border-line"
                }`}
              >
                <ProductImage
                  src={productCardImageUrl(src)}
                  alt=""
                  width={64}
                  height={64}
                  sizes="64px"
                  className="h-full w-full object-contain p-1"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-brand">
          {product.categoryName}
        </p>
        <h1 className="mt-2 text-2xl font-extrabold leading-tight text-ink sm:text-3xl">
          {product.name}
        </h1>
        <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted">
          {product.brand && <span>Marka: {product.brand}</span>}
          {product.weight && <span>Gramaj: {product.weight}</span>}
          {product.productType && <span>Tür: {product.productType}</span>}
        </p>

        <div className="mt-6 flex items-baseline gap-3">
          <p className="text-3xl font-extrabold text-ink">{money(price)}</p>
          {oldPrice && <s className="text-base text-muted">{money(oldPrice)}</s>}
          {discount && (
            <span className="rounded-full bg-brand px-2 py-1 text-xs font-bold text-white">
              %{discount} indirim
            </span>
          )}
        </div>

        {product.variants.length > 0 && (
          <fieldset className="mt-7">
            <legend className="text-sm font-bold text-ink">
              Seçenekler <span className="text-brand">*</span>
            </legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.variants.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSelectedVariant(item.id);
                    setError("");
                  }}
                  aria-pressed={selectedVariant === item.id}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    selectedVariant === item.id
                      ? "border-brand bg-brand-soft text-brand"
                      : "border-line text-ink hover:border-brand"
                  }`}
                >
                  {item.optionLabel} · {money(item.price)}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        <div className="mt-7 flex flex-wrap gap-3">
          <div className="flex items-center rounded-full border border-line">
            <button
              type="button"
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              className="px-4 py-3"
              aria-label="Adedi azalt"
            >
              <Minus size={16} />
            </button>
            <span className="w-8 text-center text-sm font-bold" aria-live="polite">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((value) => Math.min(99, value + 1))}
              className="px-4 py-3"
              aria-label="Adedi artır"
            >
              <Plus size={16} />
            </button>
          </div>

          <button
            type="button"
            onClick={addToCart}
            className="flex min-w-48 flex-1 items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-dark"
          >
            {added ? <Check size={18} /> : <ShoppingCart size={18} />}
            {added ? "Sepete Eklendi" : "Sepete Ekle"}
          </button>
        </div>

        {error && (
          <p role="alert" className="mt-3 text-sm font-medium text-brand">
            {error}
          </p>
        )}

        <div className="mt-7 flex items-start gap-3 rounded-2xl bg-brand-soft p-4 text-sm text-muted">
          <Truck size={18} className="mt-0.5 shrink-0 text-brand" />
          <p>
            Saat {cutoff}’a kadar verilen siparişler, belirlenen İstanbul ilçelerinde aynı gün
            kurye ile teslim edilir. Türkiye geneli kargo seçeneği ödeme adımında hesaplanır.
          </p>
        </div>

        <div className="mt-8 border-t border-line pt-6">
          <h2 className="font-bold text-ink">Ürün açıklaması</h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted">
            {product.description}
          </p>
        </div>
      </div>
    </div>
  );
}
