import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getCategoryBySlug, getProductsByCategory } from "@/lib/catalog";
import { hasImage } from "@/lib/product-images";
import { ProductImage } from "@/components/product-image";
import { StoreShell } from "@/components/store-shell";
import { ProductList } from "@/components/product-list";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const category = await getCategoryBySlug((await params).slug);
  return { title: category ? `${category.name} | PastaMarket` : "Kategori | PastaMarket" };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const list = await getProductsByCategory(slug);

  return (
    <StoreShell>
      <main className="container py-8">
        <nav aria-label="Sayfa yolu" className="flex items-center gap-1.5 text-xs text-muted">
          <Link href="/" className="hover:text-brand">
            Ana Sayfa
          </Link>
          <ChevronRight size={13} />
          <Link href="/urunler" className="hover:text-brand">
            Ürünler
          </Link>
          <ChevronRight size={13} />
          <span className="text-ink">{category.name}</span>
        </nav>

        <div className="mt-4 grid overflow-hidden rounded-2xl bg-brand-soft sm:grid-cols-[260px_1fr]">
          {hasImage(category.image) ? (
            <ProductImage
              src={category.image}
              alt=""
              width={520}
              height={320}
              sizes="(min-width: 640px) 260px, 100vw"
              className="h-36 w-full object-cover sm:h-full"
            />
          ) : (
            <div
              aria-hidden="true"
              className="h-36 w-full bg-[linear-gradient(135deg,#fff7f9_0%,#ffd0de_100%)] sm:h-full"
            />
          )}
          <div className="p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-wide text-brand">Kategori</p>
            <h1 className="mt-2 text-2xl font-extrabold text-ink sm:text-3xl">
              {category.name}
            </h1>
            <p className="mt-2 text-sm text-muted">
              Pastacılık çalışmalarınız için seçilmiş ürünleri inceleyin.
            </p>
          </div>
        </div>

        {/* useSearchParams istemci tarafında çalışır; statik kabuk Suspense ile sunulur. */}
        <Suspense
          fallback={<p className="mt-6 text-sm text-muted">Ürünler yükleniyor…</p>}
        >
          <ProductList products={list} showCategoryFilter={false} />
        </Suspense>
      </main>
    </StoreShell>
  );
}
