import { Suspense } from "react";
import type { Metadata } from "next";
import { getCategories } from "@/lib/catalog";
import { productPage } from "@/lib/data";
import { StoreShell } from "@/components/store-shell";
import { ProductList } from "@/components/product-list";
import { ProductsHeading } from "@/components/products-heading";

export const metadata: Metadata = { title: "Tüm Ürünler | PastaMarket" };

/**
 * İlk sayfa 24 ürünle sınırlıdır; devamı cursor API'sinden yüklenir.
 */
export const revalidate = 300;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; brand?: string }>;
}) {
  const search = await searchParams;
  const tag = search.tag === "best" || search.tag === "new" ? search.tag : undefined;
  const brand = search.brand || undefined;
  const [page, categories] = await Promise.all([productPage({ limit: 24, tag, brand }), getCategories()]);

  return (
    <StoreShell>
      <main className="container py-8">
        <Suspense fallback={<h1 className="text-2xl font-extrabold text-ink sm:text-3xl">Tüm Ürünler</h1>}>
          <ProductsHeading />
        </Suspense>

        <Suspense fallback={<p className="mt-6 text-sm text-muted">Ürünler yükleniyor…</p>}>
          <ProductList products={page.products} categories={categories} nextCursor={page.nextCursor} />
        </Suspense>
      </main>
    </StoreShell>
  );
}
