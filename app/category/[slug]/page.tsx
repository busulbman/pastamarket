import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { categories, products } from "@/lib/db";
import { ProductImage } from "@/components/product-image";
import { hasImage } from "@/lib/product-images";
import { StoreShell } from "@/components/store-shell";
import { ProductCard } from "@/components/product-card";
import { SortSelect } from "@/components/sort-select";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string }>;
}) {
  const { slug } = await params;
  const { sort } = await searchParams;
  const category = categories().find((item) => item.slug === slug);
  if (!category) notFound();

  const list = products({ category: slug, sort });

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

        <div className="my-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted">{list.length} ürün</p>
          <Suspense fallback={null}>
            <SortSelect value={sort} />
          </Suspense>
        </div>

        {list.length > 0 ? (
          <div className="product-grid">
            {list.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl bg-brand-soft p-8 text-center text-sm text-muted">
            Bu kategoride şu anda satışta ürün bulunmuyor.
          </p>
        )}
      </main>
    </StoreShell>
  );
}
