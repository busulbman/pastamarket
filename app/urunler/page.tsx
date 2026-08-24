import { Suspense } from "react";
import type { Metadata } from "next";
import { getCategories, getProducts } from "@/lib/catalog";
import { StoreShell } from "@/components/store-shell";
import { ProductList } from "@/components/product-list";
import { ProductsHeading } from "@/components/products-heading";

export const metadata: Metadata = { title: "Tüm Ürünler | PastaMarket" };

/**
 * Tüm ürünler sayfası statik üretilir; katalog build sırasında gömülür.
 * Arama, marka ve etiket filtreleri tarayıcıda çalışır (bkz. ProductList).
 */
export const revalidate = 300;

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  return (
    <StoreShell>
      <main className="container py-8">
        <Suspense fallback={<h1 className="text-2xl font-extrabold text-ink sm:text-3xl">Tüm Ürünler</h1>}>
          <ProductsHeading />
        </Suspense>

        <Suspense fallback={<p className="mt-6 text-sm text-muted">Ürünler yükleniyor…</p>}>
          <ProductList products={products} categories={categories} />
        </Suspense>
      </main>
    </StoreShell>
  );
}
