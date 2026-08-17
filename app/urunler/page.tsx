import Link from "next/link";
import { Suspense } from "react";
import { categories, countProducts, products } from "@/lib/data";
import { StoreShell } from "@/components/store-shell";
import { ProductCard } from "@/components/product-card";
import { SortSelect } from "@/components/sort-select";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 40;

type Search = {
  q?: string;
  tag?: "best" | "new";
  sort?: string;
  brand?: string;
  page?: string;
};

function title(params: Search) {
  if (params.q) return `“${params.q}” için sonuçlar`;
  if (params.brand) return params.brand;
  if (params.tag === "new") return "Yeni Ürünler";
  if (params.tag === "best") return "Çok Satanlar";
  return "Tüm Ürünler";
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const filters = {
    q: params.q,
    tag: params.tag,
    sort: params.sort,
    brand: params.brand,
  };

  const total = await countProducts(filters);
  const list = await products({ ...filters, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE });
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const nav = await categories();

  const pageHref = (next: number) => {
    const query = new URLSearchParams();
    Object.entries({ ...filters, page: next > 1 ? String(next) : "" }).forEach(
      ([key, value]) => {
        if (value) query.set(key, String(value));
      },
    );
    const search = query.toString();
    return search ? `/urunler?${search}` : "/urunler";
  };

  return (
    <StoreShell>
      <main className="container py-8">
        <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">{title(params)}</h1>

        <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto pb-1">
          <Link
            href="/urunler"
            className="shrink-0 rounded-full border border-line bg-white px-4 py-2 text-xs font-semibold transition hover:border-brand hover:text-brand"
          >
            Tümü
          </Link>
          {nav.map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              className="shrink-0 rounded-full border border-line bg-white px-4 py-2 text-xs font-semibold transition hover:border-brand hover:text-brand"
            >
              {category.name}
            </Link>
          ))}
        </div>

        <div className="my-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted">{total} ürün bulundu</p>
          <Suspense fallback={null}>
            <SortSelect value={params.sort} />
          </Suspense>
        </div>

        {list.length > 0 ? (
          <>
            <div className="product-grid">
              {list.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {pageCount > 1 && (
              <nav
                aria-label="Sayfalar"
                className="mt-10 flex flex-wrap items-center justify-center gap-2"
              >
                {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
                  <Link
                    key={number}
                    href={pageHref(number)}
                    aria-current={number === page ? "page" : undefined}
                    className={`grid h-9 min-w-9 place-items-center rounded-full px-3 text-sm font-semibold transition ${
                      number === page
                        ? "bg-brand text-white"
                        : "border border-line bg-white text-ink hover:border-brand hover:text-brand"
                    }`}
                  >
                    {number}
                  </Link>
                ))}
              </nav>
            )}
          </>
        ) : (
          <div className="rounded-2xl bg-brand-soft p-8 text-center">
            <h2 className="text-lg font-bold text-ink">
              Aramanızla eşleşen ürün bulunamadı.
            </h2>
            <p className="mt-2 text-sm text-muted">
              Kategorilere göz atarak aradığınız ürüne ulaşabilirsiniz.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {nav.map((category) => (
                <Link
                  key={category.slug}
                  href={`/category/${category.slug}`}
                  className="rounded-full border border-line bg-white px-4 py-2 text-sm transition hover:border-brand hover:text-brand"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </StoreShell>
  );
}
