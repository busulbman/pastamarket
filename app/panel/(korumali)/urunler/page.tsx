import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { categories, countProducts, products } from "@/lib/db";
import { money } from "@/lib/format";
import { ProductImage } from "@/components/product-image";
import { ProductFilters } from "@/components/panel/product-filters";
import { ProductRowActions } from "@/components/panel/product-row-actions";
import { EmptyState, PageHeader, primaryButton } from "@/components/panel/ui";
import { demoReadOnly } from "@/lib/config";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Ürünler | PastaMarket" };

const PAGE_SIZE = 20;

type Search = { q?: string; kategori?: string; durum?: string; sayfa?: string };

export default async function PanelProducts({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.sayfa) || 1);
  const categoryList = categories(false);

  const filters = {
    q: params.q,
    categoryId: Number(params.kategori) || undefined,
    includeInactive: params.durum !== "aktif",
    sort: "newest",
  };

  // Pasif filtresi ayrı ele alınır: sorgu katmanı yalnızca "aktifleri gizle"yi bilir.
  const total = countProducts(filters);
  const all = products({ ...filters, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE });
  const list = params.durum === "pasif" ? all.filter((item) => !item.active) : all;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const pageHref = (next: number) => {
    const query = new URLSearchParams();
    if (params.q) query.set("q", params.q);
    if (params.kategori) query.set("kategori", params.kategori);
    if (params.durum) query.set("durum", params.durum);
    if (next > 1) query.set("sayfa", String(next));
    const search = query.toString();
    return search ? `/panel/urunler?${search}` : "/panel/urunler";
  };

  return (
    <>
      <PageHeader
        title="Ürünler"
        description={`${total} ürün listeleniyor`}
        action={
          <Link href="/panel/urunler/yeni" className={primaryButton}>
            <Plus size={16} />
            Yeni ürün
          </Link>
        }
      />

      <Suspense fallback={null}>
        <ProductFilters categories={categoryList} />
      </Suspense>

      {list.length === 0 ? (
        <EmptyState>
          Filtrelerinize uyan ürün bulunamadı.{" "}
          <Link href="/panel/urunler" className="font-semibold text-brand">
            Filtreleri temizle
          </Link>
        </EmptyState>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-line-soft bg-zinc-50 text-xs text-muted">
                <tr>
                  <th className="p-3 font-semibold">Ürün</th>
                  <th className="p-3 font-semibold">Kategori</th>
                  <th className="p-3 font-semibold">Fiyat</th>
                  <th className="p-3 font-semibold">Seçenek</th>
                  <th className="p-3 text-right font-semibold">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {list.map((product) => (
                  <tr key={product.id} className="border-b border-line-soft last:border-0">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <span className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-brand-soft">
                          <ProductImage
                            src={product.mainImage}
                            alt=""
                            width={44}
                            height={44}
                            className="h-full w-full object-contain"
                          />
                        </span>
                        <span className="min-w-0">
                          <Link
                            href={`/panel/urunler/${product.id}`}
                            className="block font-semibold text-ink hover:text-brand"
                          >
                            {product.name}
                          </Link>
                          <span className="text-xs text-muted">
                            {[product.weight, product.brand].filter(Boolean).join(" · ") ||
                              product.unit}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-muted">{product.categoryName}</td>
                    <td className="p-3">
                      <b>{money(product.salePrice ?? product.price)}</b>
                      {product.salePrice && (
                        <s className="ml-1.5 text-xs text-muted">{money(product.price)}</s>
                      )}
                    </td>
                    <td className="p-3 text-muted">
                      {product.variants.length > 0 ? `${product.variants.length} seçenek` : "—"}
                    </td>
                    <td className="p-3">
                      <ProductRowActions
                        id={product.id}
                        name={product.name}
                        active={product.active}
                        readOnly={demoReadOnly}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {pageCount > 1 && (
        <nav aria-label="Sayfalar" className="mt-6 flex flex-wrap justify-center gap-2">
          {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
            <Link
              key={number}
              href={pageHref(number)}
              aria-current={number === page ? "page" : undefined}
              className={`grid h-9 min-w-9 place-items-center rounded-lg px-3 text-sm font-semibold ${
                number === page
                  ? "bg-brand text-white"
                  : "border border-line bg-white text-ink hover:border-brand"
              }`}
            >
              {number}
            </Link>
          ))}
        </nav>
      )}
    </>
  );
}
