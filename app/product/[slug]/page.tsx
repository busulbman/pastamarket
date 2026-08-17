import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { productBySlug, products, settings } from "@/lib/data";
import { StoreShell } from "@/components/store-shell";
import { ProductCard } from "@/components/product-card";
import { ProductDetail } from "@/components/product-detail";
import { SectionHeading } from "@/components/section-heading";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const product = await productBySlug((await params).slug);
  if (!product) return { title: "Ürün bulunamadı | PastaMarket" };
  return {
    title: `${product.name} | PastaMarket`,
    description: product.description.slice(0, 155),
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const product = await productBySlug((await params).slug);
  if (!product) notFound();

  // Önceki sürümde benzer ürünler kategoriden bağımsız 4 kayıt çekip
  // filtrelediği için çoğu üründe boş kalıyordu.
  const similar = (await products({ category: product.categorySlug, limit: 6 }))
    .filter((item) => item.id !== product.id)
    .slice(0, 5);

  const s = await settings();

  return (
    <StoreShell>
      <main className="container py-8">
        <nav aria-label="Sayfa yolu" className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-muted">
          <Link href="/" className="hover:text-brand">
            Ana Sayfa
          </Link>
          <ChevronRight size={13} />
          {product.categorySlug && (
            <>
              <Link href={`/category/${product.categorySlug}`} className="hover:text-brand">
                {product.categoryName}
              </Link>
              <ChevronRight size={13} />
            </>
          )}
          <span className="text-ink">{product.name}</span>
        </nav>

        <ProductDetail product={product} cutoff={s.same_day_cutoff} />

        {similar.length > 0 && (
          <section className="mt-16">
            <SectionHeading
              title="Benzer Ürünler"
              href={`/category/${product.categorySlug}`}
            />
            <div className="product-grid">
              {similar.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}
      </main>
    </StoreShell>
  );
}
