"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Home,
  LayoutGrid,
  Menu,
  MessageCircle,
  Search,
  ShoppingCart,
  Star,
  Tag,
  X,
  type LucideIcon,
} from "lucide-react";
import { useCart } from "@/components/cart";
import { WhatsAppIcon } from "@/components/icons";
import { CategoryIcon } from "@/components/category-icons";

type NavCategory = { name: string; slug: string };

type MenuItem = {
  href: string;
  label: string;
  /** Mobil menüde solda gösterilen ikon. */
  icon?: LucideIcon;
  /** İkon yerine "NEW" rozeti göster. */
  badge?: boolean;
};

const MENU: MenuItem[] = [
  { href: "/", label: "Ana Sayfa", icon: Home },
  { href: "/urunler?tag=best", label: "Çok Satanlar", icon: Star },
  { href: "/urunler?tag=new", label: "Yeni Ürünler", badge: true },
  { href: "/markalar", label: "Markalar", icon: Tag },
  { href: "/iletisim", label: "İletişim", icon: MessageCircle },
];

/** Şeffaf arka planlı yatay logo; en-boy oranı 3:1 korunur. */
const LOGO = { src: "/images/pastamarket-logo.png", width: 2172, height: 724 };

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

  // Drawer açıkken arka sayfa kaymasın; Escape ile kapansın.
  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

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
            <Image
              src={LOGO.src}
              alt="PastaMarket"
              width={LOGO.width}
              height={LOGO.height}
              priority
              className="h-7 w-auto object-contain md:h-9"
            />
            <span className="mt-0.5 hidden text-[10px] leading-3 text-muted sm:block">
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
        <div
          className="fixed inset-0 z-50 bg-ink/40 lg:hidden"
          onClick={() => setMenuOpen(false)}
        >
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Menü"
            className="flex h-full w-[86vw] max-w-[340px] flex-col bg-white pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pt-[env(safe-area-inset-top)] shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-line-soft px-5 py-4">
              <Image
                src={LOGO.src}
                alt="PastaMarket"
                width={LOGO.width}
                height={LOGO.height}
                className="h-7 w-auto object-contain"
              />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Menüyü kapat"
                className="-mr-2 grid h-10 w-10 place-items-center rounded-full text-ink transition active:bg-brand-soft"
              >
                <X size={22} />
              </button>
            </div>

            {/* Drawer kendi içinde kaydırılır; arka sayfa kilitlidir. */}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <nav aria-label="Mobil menü">
                <ul>
                  {MENU.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className="flex min-h-[58px] items-center gap-3.5 border-b border-line-soft px-5 transition hover:bg-brand-soft active:bg-brand-soft"
                      >
                        <span className="grid w-6 shrink-0 place-items-center text-brand">
                          {item.badge ? (
                            <span className="rounded-md bg-brand px-1.5 py-0.5 text-[9px] font-extrabold leading-none tracking-wide text-white">
                              NEW
                            </span>
                          ) : (
                            item.icon && <item.icon size={20} strokeWidth={1.7} />
                          )}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-[15px] font-semibold text-ink">
                          {item.label}
                        </span>
                        <ChevronRight size={17} strokeWidth={1.7} className="shrink-0 text-ink/50" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* KATEGORİLER ayıracı */}
              <div className="flex items-center gap-2 px-5 py-5" aria-hidden="true">
                <span className="h-px flex-1 bg-line" />
                <span className="h-1 w-1 shrink-0 rounded-full bg-brand-2" />
                <span className="px-1 text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
                  Kategoriler
                </span>
                <span className="h-1 w-1 shrink-0 rounded-full bg-brand-2" />
                <span className="h-px flex-1 bg-line" />
              </div>

              <nav aria-label="Kategoriler">
                <ul>
                  {categories.map((category) => (
                    <li key={category.slug}>
                      <Link
                        href={`/category/${category.slug}`}
                        onClick={() => setMenuOpen(false)}
                        className="flex min-h-[58px] items-center gap-3.5 border-b border-line-soft px-5 transition hover:bg-brand-soft active:bg-brand-soft"
                      >
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">
                          <CategoryIcon slug={category.slug} className="h-[19px] w-[19px]" />
                        </span>
                        <span className="min-w-0 flex-1 truncate text-[15px] font-semibold text-ink">
                          {category.name}
                        </span>
                        <ChevronRight size={17} strokeWidth={1.7} className="shrink-0 text-ink/50" />
                      </Link>
                    </li>
                  ))}

                  <li>
                    <Link
                      href="/urunler"
                      onClick={() => setMenuOpen(false)}
                      className="flex min-h-[58px] items-center gap-3.5 px-5 transition hover:bg-brand-soft active:bg-brand-soft"
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">
                        <LayoutGrid size={19} strokeWidth={1.7} />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[15px] font-semibold text-brand">
                        Tüm Ürünler
                      </span>
                      <ChevronRight size={17} strokeWidth={1.7} className="shrink-0 text-ink/50" />
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
