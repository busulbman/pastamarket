import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-brand-soft p-6 text-center">
      <div>
        <p className="text-5xl font-extrabold text-brand">404</p>
        <h1 className="mt-4 text-2xl font-extrabold text-ink">Sayfa bulunamadı</h1>
        <p className="mt-2 text-sm text-muted">
          Aradığınız sayfa taşınmış veya kaldırılmış olabilir.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="rounded-full bg-brand px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-dark"
          >
            Ana Sayfa
          </Link>
          <Link
            href="/urunler"
            className="rounded-full border border-line bg-white px-6 py-3 text-sm font-bold text-ink transition hover:border-brand hover:text-brand"
          >
            Tüm Ürünler
          </Link>
        </div>
      </div>
    </main>
  );
}
