"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/product-card";

/**
 * Ürün listesi — filtreleme, arama ve sıralama TAMAMEN TARAYICIDA çalışır.
 *
 * Ürün verisi build sırasında JSON'dan gelip sayfaya gömülür; çalışma
 * zamanında sunucuya istek yapılmaz. Site statik dışa aktarılabilir kalır.
 */

const PAGE_SIZE = 24;

const SORT_OPTIONS = [
  { value: "", label: "Öne çıkanlar" },
  { value: "price_asc", label: "Fiyat: artan" },
  { value: "price_desc", label: "Fiyat: azalan" },
  { value: "name", label: "İsme göre (A–Z)" },
];

const lower = (value: string) => value.toLocaleLowerCase("tr-TR");

export function ProductList({
  products,
  categories = [],
  showCategoryFilter = true,
}: {
  products: Product[];
  categories?: { name: string; slug: string }[];
  showCategoryFilter?: boolean;
}) {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const tag = searchParams.get("tag") ?? "";
  const brand = searchParams.get("brand") ?? "";

  const [sort, setSort] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    let list = products;

    if (tag === "best") list = list.filter((p) => p.isBestSeller);
    if (tag === "new") list = list.filter((p) => p.isNew);
    if (brand) list = list.filter((p) => p.brand === brand);

    if (query.trim()) {
      const needle = lower(query.trim());
      list = list.filter((product) =>
        lower(
          `${product.name} ${product.description} ${product.brand} ${product.categoryName ?? ""} ${product.weight}`,
        ).includes(needle),
      );
    }

    const sorted = [...list];
    switch (sort) {
      case "price_asc":
        return sorted.sort((a, b) => a.price - b.price);
      case "price_desc":
        return sorted.sort((a, b) => b.price - a.price);
      case "name":
        return sorted.sort((a, b) => a.name.localeCompare(b.name, "tr-TR"));
      default:
        return sorted.sort(
          (a, b) => Number(b.isBestSeller) - Number(a.isBestSeller),
        );
    }
  }, [products, query, tag, brand, sort]);

  const shown = filtered.slice(0, visible);

  return (
    <>
      {showCategoryFilter && categories.length > 0 && (
        <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto pb-1">
          <Link
            href="/urunler"
            className="shrink-0 rounded-full border border-line bg-white px-4 py-2 text-xs font-semibold transition hover:border-brand hover:text-brand"
          >
            Tümü
          </Link>
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              className="shrink-0 rounded-full border border-line bg-white px-4 py-2 text-xs font-semibold transition hover:border-brand hover:text-brand"
            >
              {category.name}
            </Link>
          ))}
        </div>
      )}

      <div className="my-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">{filtered.length} ürün bulundu</p>
        <label className="flex items-center gap-2 text-sm text-muted">
          <span className="hidden sm:inline">Sırala</span>
          <select
            value={sort}
            onChange={(event) => {
              setSort(event.target.value);
              setVisible(PAGE_SIZE);
            }}
            className="rounded-full border border-line bg-white px-4 py-2 text-sm text-ink outline-none focus:border-brand"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {shown.length > 0 ? (
        <>
          <div className="product-grid">
            {shown.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {visible < filtered.length && (
            <div className="mt-10 text-center">
              <button
                type="button"
                onClick={() => setVisible((value) => value + PAGE_SIZE)}
                className="rounded-full border border-brand px-6 py-3 text-sm font-bold text-brand transition hover:bg-brand hover:text-white"
              >
                Daha fazla göster ({filtered.length - visible})
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-2xl bg-brand-soft p-8 text-center">
          <h2 className="text-lg font-bold text-ink">
            {query ? `“${query}” ile eşleşen ürün bulunamadı.` : "Ürün bulunamadı."}
          </h2>
          <p className="mt-2 text-sm text-muted">
            Kategorilere göz atarak aradığınız ürüne ulaşabilirsiniz.
          </p>
          {categories.length > 0 && (
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/category/${category.slug}`}
                  className="rounded-full border border-line bg-white px-4 py-2 text-sm transition hover:border-brand hover:text-brand"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
