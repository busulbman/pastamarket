"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown, LayoutGrid, Menu, Search, ShoppingCart, X } from "lucide-react";
import { useCart } from "@/components/cart";
import { WhatsAppIcon } from "@/components/icons";

type NavCategory = { name: string; slug: string };

const MENU = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/urunler?tag=best", label: "Çok Satanlar" },
  { href: "/urunler?tag=new", label: "Yeni Ürünler" },
  { href: "/markalar", label: "Markalar" },
  { href: "/iletisim", label: "İletişim" },
];

const SEARCH_PLACEHOLDER = "Ürün, kategori veya marka ara…";

export function Header({
  brand,
  tagline,
  announcement,
  whatsappHref,
  categories,
}: {
  brand: string;
  tagline: string;
  announcement: string;
  whatsappHref: string | null;
  categories: NavCategory[];
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { count } = useCart();

  function search(event: React.FormEvent) {
    event.preventDefault();
    const term = query.trim();
    router.push(term ? `/urunler?q=${encodeURIComponent(term)}` : "/urunler");
    setMenuOpen(false);
  }

  return (
    <>
      {announcement && (
        <div className="bg-ink px-4 py-2.5 text-center text-[11px] font-medium leading-4 text-white sm:text-xs">
          {announcement}
        </div>
      )}

      <header className="sticky top-0 z-40 border-b border-line-soft bg-white">
        <div className="container flex items-center gap-3 py-3 md:gap-6 md:py-4">
          <button
            type="button"
            className="lg:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label="Menüyü aç"
          >
            <Menu size={24} />
          </button>

          <Link href="/" className="shrink-0" aria-label={`${brand} ana sayfa`}>
            <span className="block text-xl font-extrabold tracking-tight text-brand md:text-2xl">
              {brand}
            </span>
            <span className="hidden text-[10px] leading-3 text-muted sm:block">
              {tagline}
            </span>
          </Link>

          <form
            onSubmit={search}
            role="search"
            className="ml-auto hidden max-w-2xl flex-1 items-center rounded-full border border-line bg-white pl-5 md:flex"
          >
            <label htmlFor="site-search" className="sr-only">
              Ürün ara
            </label>
            <input
              id="site-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted"
              placeholder={SEARCH_PLACEHOLDER}
            />
            <button
              type="submit"
              aria-label="Ara"
              className="m-1 grid h-9 w-11 place-items-center rounded-full bg-brand text-white transition hover:bg-brand-dark"
            >
              <Search size={17} />
            </button>
          </form>

          <div className="ml-auto flex items-center gap-4 md:ml-0">
            {whatsappHref && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden items-center gap-2 text-sm font-medium text-ink lg:flex"
              >
                <WhatsAppIcon className="h-5 w-5 text-brand" />
                WhatsApp
              </a>
            )}

            <Link
              href="/cart"
              className="relative flex items-center gap-2 text-sm font-medium"
              aria-label={`Sepetim, ${count} ürün`}
            >
              <span className="relative">
                <ShoppingCart size={22} />
                {count > 0 && (
                  <span className="absolute -right-2 -top-2 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-brand px-1 text-[10px] font-bold leading-none text-white">
                    {count}
                  </span>
                )}
              </span>
              <span className="hidden sm:inline">Sepetim</span>
            </Link>
          </div>
        </div>

        {/* Mobil arama */}
        <div className="container pb-3 md:hidden">
          <form
            onSubmit={search}
            role="search"
            className="flex items-center rounded-full border border-line bg-white pl-4"
          >
            <label htmlFor="site-search-mobile" className="sr-only">
              Ürün ara
            </label>
            <input
              id="site-search-mobile"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted"
              placeholder="Ürün, kategori veya marka ara…"
            />
            <button
              type="submit"
              aria-label="Ara"
              className="m-1 grid h-8 w-10 place-items-center rounded-full bg-brand text-white"
            >
              <Search size={16} />
            </button>
          </form>
        </div>
      </header>

      {/* Masaüstü menü */}
      <nav aria-label="Ana menü" className="hidden border-b border-line-soft bg-white lg:block">
        <div className="container flex h-12 items-center gap-7 text-sm font-medium">
          <div className="group relative -my-px h-full">
            <button
              type="button"
              className="flex h-full items-center gap-2 rounded-t-lg bg-brand px-4 font-semibold text-white"
              aria-haspopup="true"
            >
              <LayoutGrid size={16} />
              Tüm Kategoriler
              <ChevronDown size={15} />
            </button>
            <div className="invisible absolute left-0 top-full z-30 w-60 rounded-b-xl border border-line bg-white p-2 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/category/${category.slug}`}
                  className="block rounded-lg px-3 py-2 hover:bg-brand-soft hover:text-brand"
                >
                  {category.name}
                </Link>
              ))}
              <Link
                href="/urunler"
                className="block rounded-lg px-3 py-2 font-semibold text-brand hover:bg-brand-soft"
              >
                Tüm Ürünler
              </Link>
            </div>
          </div>

          {MENU.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-brand">
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobil menü */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-ink/40 lg:hidden" onClick={() => setMenuOpen(false)}>
          <aside
            className="h-full w-80 max-w-[85vw] overflow-y-auto bg-white p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="text-lg font-extrabold text-brand">{brand}</span>
              <button type="button" onClick={() => setMenuOpen(false)} aria-label="Menüyü kapat">
                <X />
              </button>
            </div>

            <nav aria-label="Mobil menü" className="mt-6">
              {MENU.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="block border-b border-line-soft py-3 text-sm font-semibold"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <p className="mt-6 text-xs font-bold uppercase tracking-wide text-muted">
              Kategoriler
            </p>
            <div className="mt-2">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/category/${category.slug}`}
                  onClick={() => setMenuOpen(false)}
                  className="block border-b border-line-soft py-3 text-sm"
                >
                  {category.name}
                </Link>
              ))}
              <Link
                href="/urunler"
                onClick={() => setMenuOpen(false)}
                className="block py-3 text-sm font-semibold text-brand"
              >
                Tüm Ürünler
              </Link>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
