"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ORDER_STATUSES } from "@/lib/constants";

const DEBOUNCE_MS = 350;

export function OrderFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const initial = useRef(true);

  function push(next: URLSearchParams) {
    const search = next.toString();
    router.push(search ? `${pathname}?${search}` : pathname);
  }

  function update(key: string, value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    push(next);
  }

  useEffect(() => {
    if (initial.current) {
      initial.current = false;
      return;
    }
    const timer = setTimeout(() => update("q", query.trim()), DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const field =
    "rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-brand";

  return (
    <div className="mb-5 flex flex-wrap gap-3">
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Sipariş no, müşteri veya telefon"
        aria-label="Sipariş ara"
        className={`${field} min-w-56 flex-1`}
      />

      <select
        value={searchParams.get("durum") ?? ""}
        onChange={(event) => update("durum", event.target.value)}
        aria-label="Duruma göre filtrele"
        className={field}
      >
        <option value="">Tüm durumlar</option>
        {ORDER_STATUSES.map((status) => (
          <option key={status}>{status}</option>
        ))}
      </select>

      <label className="flex items-center gap-2 text-sm text-muted">
        Başlangıç
        <input
          type="date"
          value={searchParams.get("baslangic") ?? ""}
          onChange={(event) => update("baslangic", event.target.value)}
          className={field}
        />
      </label>

      <label className="flex items-center gap-2 text-sm text-muted">
        Bitiş
        <input
          type="date"
          value={searchParams.get("bitis") ?? ""}
          onChange={(event) => update("bitis", event.target.value)}
          className={field}
        />
      </label>
    </div>
  );
}
