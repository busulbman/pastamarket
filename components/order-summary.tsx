"use client";

import { money } from "@/lib/format";
import { ProductImage } from "@/components/product-image";
import type { CartItem } from "@/components/cart";

/** Ödeme adımındaki sipariş özeti kutusu. */
export function OrderSummary({
  items,
  subtotal,
  deliveryFee,
  error,
  loading,
  disabled = false,
}: {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  error?: string;
  loading?: boolean;
  /** Canlı demoda sipariş oluşturma kapalıdır. */
  disabled?: boolean;
}) {
  return (
    <aside className="card h-fit p-5 lg:sticky lg:top-28">
      <h2 className="font-bold text-ink">Sipariş Özeti</h2>

      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li
            key={`${item.productId}:${item.variantId ?? "base"}`}
            className="flex items-center gap-3 text-sm"
          >
            <span className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-brand-soft">
              <ProductImage
                src={item.image}
                alt=""
                width={44}
                height={44}
                sizes="44px"
                className="h-full w-full object-contain p-0.5"
              />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-ink">{item.name}</span>
              <span className="text-xs text-muted">
                {item.variantLabel ? `${item.variantLabel} · ` : ""}
                {item.quantity} adet
              </span>
            </span>
            <b className="shrink-0">{money(item.unitPrice * item.quantity)}</b>
          </li>
        ))}
      </ul>

      <div className="mt-5 space-y-3 border-t border-line-soft pt-4 text-sm">
        <p className="flex justify-between">
          <span className="text-muted">Ara toplam</span>
          <b>{money(subtotal)}</b>
        </p>
        <p className="flex justify-between">
          <span className="text-muted">Teslimat</span>
          <b>{deliveryFee > 0 ? money(deliveryFee) : "Ücretsiz"}</b>
        </p>
        <p className="flex justify-between border-t border-line-soft pt-3 text-base">
          <b>Genel toplam</b>
          <b className="text-brand">{money(subtotal + deliveryFee)}</b>
        </p>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-brand-soft p-3 text-sm text-brand">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || disabled}
        className="mt-5 w-full rounded-full bg-brand py-3.5 text-sm font-bold text-white transition hover:bg-brand-dark disabled:opacity-60"
      >
        {loading ? "Sipariş kaydediliyor…" : "Siparişi Oluştur"}
      </button>

      <p className="mt-3 text-center text-[11px] leading-4 text-muted">
        Üye olmadan sipariş verebilirsiniz. Online kredi kartı ödemesi alınmaz.
      </p>
    </aside>
  );
}
