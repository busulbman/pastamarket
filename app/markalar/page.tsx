import Link from "next/link";
import type { Metadata } from "next";
import { brands } from "@/lib/data";
import { StoreShell } from "@/components/store-shell";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Markalar | PastaMarket" };

export default async function BrandsPage() {
  const list = await brands();

  return (
    <StoreShell>
      <main className="container py-8">
        <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">Markalar</h1>
        <p className="mt-2 text-sm text-muted">
          Katalogda yer alan markalar ve ürün adetleri.
        </p>

        {list.length > 0 ? (
          <ul className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {list.map((brand) => (
              <li key={brand.name}>
                <Link
                  href={`/urunler?brand=${encodeURIComponent(brand.name)}`}
                  className="flex h-full items-center justify-between gap-3 rounded-2xl border border-line bg-white p-5 transition hover:border-brand hover:shadow-[var(--shadow-card-hover)]"
                >
                  <span className="font-semibold text-ink">{brand.name}</span>
                  <span className="shrink-0 rounded-full bg-brand-soft px-2.5 py-1 text-xs font-bold text-brand">
                    {brand.n}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-8 rounded-2xl bg-brand-soft p-8 text-center text-sm text-muted">
            Ürünlere marka bilgisi girildiğinde bu sayfada listelenir. Marka alanı yönetim
            paneli → Ürünler ekranından doldurulur.
          </p>
        )}
      </main>
    </StoreShell>
  );
}
