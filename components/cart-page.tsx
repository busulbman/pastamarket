"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { cartKey, useCart } from "@/components/cart";
import { money } from "@/lib/format";
import { ProductImage } from "@/components/product-image";

export function CartPage() {
  const { items, remove, setQuantity, subtotal } = useCart();

  if (!items.length) {
    return (
      <div className="py-16 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand-soft text-brand">
          <ShoppingCart size={28} />
        </span>
        <h1 className="mt-5 text-2xl font-extrabold text-ink">Sepetiniz boş</h1>
        <p className="mt-2 text-sm text-muted">
          Beğendiğiniz ürünleri sepete ekleyerek alışverişe başlayabilirsiniz.
        </p>
        <Link
          href="/urunler"
          className="mt-6 inline-block rounded-full bg-brand px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-dark"
        >
          Alışverişe Başla
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-ink sm:text-3xl">Sepetim</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <ul className="card divide-y divide-line-soft">
          {items.map((item) => (
            <li key={cartKey(item)} className="flex gap-4 p-4">
              <Link
                href={`/product/${item.slug}`}
                className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-brand-soft"
              >
                <ProductImage
                  src={item.image}
                  alt=""
                  width={80}
                  height={80}
                  sizes="80px"
                  className="h-full w-full object-contain p-1"
                />
              </Link>

              <div className="min-w-0 flex-1">
                <Link
                  href={`/product/${item.slug}`}
                  className="text-sm font-semibold text-ink hover:text-brand"
                >
                  {item.name}
                </Link>
                {item.variantLabel && (
                  <p className="mt-1 text-xs text-muted">{item.variantLabel}</p>
                )}
                <p className="mt-2 text-sm font-bold text-ink">{money(item.unitPrice)}</p>
              </div>

              <div className="flex flex-col items-end justify-between gap-3">
                <button
                  type="button"
                  onClick={() => remove(cartKey(item))}
                  aria-label={`${item.name} ürününü sepetten çıkar`}
                  className="text-muted transition hover:text-brand"
                >
                  <Trash2 size={17} />
                </button>

                <div className="flex items-center rounded-full border border-line">
                  <button
                    type="button"
                    className="px-3 py-2"
                    aria-label="Adedi azalt"
                    onClick={() => setQuantity(cartKey(item), item.quantity - 1)}
                  >
                    <Minus size={13} />
                  </button>
                  <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                  <button
                    type="button"
                    className="px-3 py-2"
                    aria-label="Adedi artır"
                    onClick={() => setQuantity(cartKey(item), item.quantity + 1)}
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="card h-fit p-5">
          <h2 className="font-bold text-ink">Sipariş Özeti</h2>
          <div className="mt-5 flex justify-between text-sm">
            <span className="text-muted">Ara toplam</span>
            <b>{money(subtotal)}</b>
          </div>
          <p className="mt-4 border-t border-line-soft pt-4 text-xs leading-5 text-muted">
            Teslimat ücreti, adres ve teslimat seçiminize göre ödeme adımında hesaplanır.
          </p>
          <Link
            href="/siparis"
            className="mt-5 block rounded-full bg-brand py-3 text-center text-sm font-bold text-white transition hover:bg-brand-dark"
          >
            Siparişi Tamamla
          </Link>
          <Link
            href="/urunler"
            className="mt-3 block text-center text-xs font-semibold text-muted hover:text-brand"
          >
            Alışverişe devam et
          </Link>
        </aside>
      </div>
    </div>
  );
}
