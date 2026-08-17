"use client";

import { useSearchParams } from "next/navigation";

/** Başlık, tarayıcıdaki arama/filtre parametrelerine göre değişir. */
export function ProductsHeading() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");
  const brand = searchParams.get("brand");
  const tag = searchParams.get("tag");

  const title = query
    ? `“${query}” için sonuçlar`
    : brand
      ? brand
      : tag === "new"
        ? "Yeni Ürünler"
        : tag === "best"
          ? "Çok Satanlar"
          : "Tüm Ürünler";

  return <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">{title}</h1>;
}
