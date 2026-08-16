"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

const DEBOUNCE_MS = 350;

/**
 * Ürün listesi filtreleri. Arama kutusu debounce'lu çalışır; her tuş
 * vuruşunda sunucuya istek gitmez.
 */
export function ProductFilters({
  categories,
}: {
  categories: { id: number; name: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const initial = useRef(true);

  function push(next: URLSearchParams) {
    next.delete("sayfa"); // filtre değişince ilk sayfaya dön
    const search = next.toString();
    router.push(search ? `${pathname}?${search}` : pathname);
  }

  useEffect(() => {
    if (initial.current) {
      initial.current = false;
      return;
    }

    const timer = setTimeout(() => {
      const next = new URLSearchParams(searchParams.toString());
      if (query.trim()) next.set("q", query.trim());
      else next.delete("q");
      push(next);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
    // searchParams bağımlılığa eklenirse her yönlendirmede yeniden tetiklenir.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  function changeCategory(value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set("kategori", value);
    else next.delete("kategori");
    push(next);
  }

  function changeStatus(value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set("durum", value);
    else next.delete("durum");
    push(next);
  }

  return (
    <div className="mb-5 flex flex-wrap gap-3">
      <div className="relative min-w-56 flex-1">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
        />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Ürün, marka veya açıklama ara"
          aria-label="Ürün ara"
          className="w-full rounded-lg border border-line bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-brand"
        />
      </div>

      <select
        value={searchParams.get("kategori") ?? ""}
        onChange={(event) => changeCategory(event.target.value)}
        aria-label="Kategoriye göre filtrele"
        className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-brand"
      >
        <option value="">Tüm kategoriler</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>

      <select
        value={searchParams.get("durum") ?? ""}
        onChange={(event) => changeStatus(event.target.value)}
        aria-label="Duruma göre filtrele"
        className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-brand"
      >
        <option value="">Tüm durumlar</option>
        <option value="aktif">Aktif</option>
        <option value="pasif">Pasif</option>
      </select>
    </div>
  );
}
