"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/product-card";

/**
 * İlk 24 ürün sunucudan gelir; kullanıcı isterse cursor ile bir sonraki sayfa
 * alınır. Böylece ürün kataloğu büyüse bile ilk açılışta tamamı gönderilmez.
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
  nextCursor = null,
  categorySlug,
}: {
  products: Product[];
  categories?: { name: string; slug: string }[];
  showCategoryFilter?: boolean;
  nextCursor?: string | null;
  categorySlug?: string;
}) {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const tag = searchParams.get("tag") ?? "";
  const brand = searchParams.get("brand") ?? "";

  const [loaded, setLoaded] = useState(products);
  const [cursor, setCursor] = useState<string | null>(nextCursor);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [sort, setSort] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);

  useEffect(() => { setLoaded(products); setCursor(nextCursor); }, [products, nextCursor]);

  const filtered = useMemo(() => {
    let list = loaded;

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
  }, [loaded, query, tag, brand, sort]);

  async function loadMore() {
    if (!cursor || loadingMore) return;
    setLoadingMore(true); setLoadError("");
    try {
      const params = new URLSearchParams({ cursor }); if (categorySlug) params.set("category", categorySlug); if (tag === "best" || tag === "new") params.set("tag", tag); if (brand) params.set("brand", brand);
      const response = await fetch(`/api/products?${params}`, { cache: "no-store" }); const data = await response.json().catch(() => ({}));
      if (!response.ok || !Array.isArray(data.products)) throw new Error(data.error || "Ürünler yüklenemedi.");
      setLoaded((old) => [...old, ...data.products.filter((item: Product) => !old.some((product) => product.id === item.id))]); setCursor(data.nextCursor ?? null);
    } catch (error) { setLoadError(error instanceof Error ? error.message : "Ürünler yüklenemedi."); } finally { setLoadingMore(false); }
  }

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

          {(visible < filtered.length || cursor) && (
            <div className="mt-10 text-center">
              <button
                type="button"
                onClick={() => visible < filtered.length ? setVisible((value) => value + PAGE_SIZE) : loadMore()}
                disabled={loadingMore}
                className="rounded-full border border-brand px-6 py-3 text-sm font-bold text-brand transition hover:bg-brand hover:text-white"
              >
                {loadingMore ? "Yükleniyor…" : visible < filtered.length ? `Daha fazla göster (${filtered.length - visible})` : "Daha fazla ürün yükle"}
              </button>
              {loadError && <p role="alert" className="mt-3 text-sm text-rose-600">{loadError}</p>}
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
