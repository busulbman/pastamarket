"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const OPTIONS = [
  { value: "", label: "Öne çıkanlar" },
  { value: "price_asc", label: "Fiyat: artan" },
  { value: "price_desc", label: "Fiyat: azalan" },
  { value: "name", label: "İsme göre (A–Z)" },
];

/**
 * Sıralama seçimi. Daha önce bu <select> bir Server Component içinde
 * onChange ile render ediliyordu ve "Event handlers cannot be passed to
 * Client Component props" hatasını veriyordu; kontrol artık istemci
 * tarafındadır ve mevcut arama parametrelerini koruyarak yönlendirir.
 */
export function SortSelect({ value }: { value?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function change(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next) params.set("sort", next);
    else params.delete("sort");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <label className="flex items-center gap-2 text-sm text-muted">
      <span className="hidden sm:inline">Sırala</span>
      <select
        value={value ?? ""}
        onChange={(event) => change(event.target.value)}
        className="rounded-full border border-line bg-white px-4 py-2 text-sm text-ink outline-none focus:border-brand"
      >
        {OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
