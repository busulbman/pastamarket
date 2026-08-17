import fs from "node:fs";
import path from "node:path";
import type { Product, Settings } from "@/lib/types";
import { resolveImageSrc } from "@/lib/product-images";

/**
 * Statik katalog okuyucu.
 *
 * Veriler BUILD SIRASINDA data/demo-catalog.json dosyasından okunur ve
 * sayfalara gömülür. Çalışma zamanında sunucu, veritabanı veya native modül
 * gerekmez — site tamamen statik dışa aktarılır (output: "export").
 */

export type Category = {
  id: number;
  name: string;
  slug: string;
  image: string;
  active: number;
  sort_order: number;
};

type Catalog = {
  meta: { exportedAt: string; counts: Record<string, number> };
  settings: Settings;
  categories: Category[];
  products: Product[];
};

let cache: Catalog | null = null;

function load(): Catalog {
  if (cache) return cache;

  const file = path.resolve(process.cwd(), "data/demo-catalog.json");
  if (!fs.existsSync(file)) {
    throw new Error(
      `Katalog bulunamadı: ${file}. data/demo-catalog.json dosyası depoda bulunmalıdır.`,
    );
  }

  const parsed = JSON.parse(fs.readFileSync(file, "utf8")) as Catalog;

  cache = {
    meta: parsed.meta,
    settings: parsed.settings ?? {},
    // Görsel yolları burada tek noktada çözülür: dosya yoksa placeholder gelir.
    categories: (parsed.categories ?? []).map((category) => ({
      ...category,
      image: resolveImageSrc(category.image),
    })),
    products: (parsed.products ?? []).map((product) => ({
      ...product,
      mainImage: resolveImageSrc(product.mainImage),
      images: (product.images ?? []).map(resolveImageSrc),
    })),
  };
  return cache;
}

export const getSettings = (): Settings => load().settings;

export const getCategories = (): Category[] =>
  load().categories.filter((category) => category.active);

export const getCategoryBySlug = (slug: string) =>
  getCategories().find((category) => category.slug === slug);

export const getProducts = (): Product[] =>
  load().products.filter((product) => product.active);

export const getProductBySlug = (slug: string) =>
  getProducts().find((product) => product.slug === slug) ?? null;

export const getProductsByCategory = (categorySlug: string) =>
  getProducts().filter((product) => product.categorySlug === categorySlug);

export function getProductsByTag(tag: "best" | "new", limit?: number) {
  const list = getProducts().filter((product) =>
    tag === "best" ? product.isBestSeller : product.isNew,
  );
  return limit ? list.slice(0, limit) : list;
}

export function getBrands() {
  const counts = new Map<string, number>();
  for (const product of getProducts()) {
    const brand = product.brand?.trim();
    if (!brand) continue;
    counts.set(brand, (counts.get(brand) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, n]) => ({ name, n }))
    .sort((a, b) => a.name.localeCompare(b.name, "tr-TR"));
}
