import fs from "node:fs";
import path from "node:path";
import type { Product, Settings } from "@/lib/types";
import type {
  Category,
  DashboardStats,
  DataProvider,
  OrderFilters,
  OrderItemRow,
  OrderRow,
  ProductFilters,
} from "@/lib/data/types";

/**
 * Salt-okunur JSON sağlayıcı (DATA_PROVIDER=json).
 *
 * Netlify demo ortamı bunu kullanır. better-sqlite3 import EDİLMEZ, native
 * binding yüklenmez, hiçbir veritabanı bağlantısı açılmaz.
 *
 * Katalog `npm run demo:export` ile üretilir ve süreç başına bir kez okunur.
 */

type Catalog = {
  meta: { exportedAt: string; counts: Record<string, number> };
  settings: Settings;
  categories: Category[];
  products: (Product & { createdAt?: string })[];
};

const CANDIDATES = [
  "data/demo-catalog.json",
  // Netlify Functions paket kökü
  "/var/task/data/demo-catalog.json",
];

let cache: Catalog | null = null;

function loadCatalog(): Catalog {
  if (cache) return cache;

  const tried: string[] = [];
  for (const candidate of CANDIDATES) {
    const file = candidate.startsWith("/")
      ? candidate
      : path.resolve(process.cwd(), candidate);
    tried.push(file);
    if (!fs.existsSync(file)) continue;

    const parsed = JSON.parse(fs.readFileSync(file, "utf8")) as Catalog;
    cache = {
      meta: parsed.meta,
      settings: parsed.settings ?? {},
      categories: parsed.categories ?? [],
      products: parsed.products ?? [],
    };
    return cache;
  }

  throw new Error(
    `Demo kataloğu bulunamadı. Aranan yollar: ${tried.join(", ")}. ` +
      "`npm run demo:export` çalıştırıp data/demo-catalog.json dosyasını deploy paketine ekleyin.",
  );
}

/** Katalog okunabiliyor mu? Sağlık kontrolü için. */
export function catalogHealth() {
  const catalog = loadCatalog();
  return {
    exportedAt: catalog.meta?.exportedAt ?? null,
    categories: catalog.categories.length,
    products: catalog.products.length,
    variants: catalog.products.reduce((n, p) => n + p.variants.length, 0),
  };
}

const lower = (value: string) => value.toLocaleLowerCase("tr-TR");

function matches(product: Product, filters: ProductFilters) {
  if (!filters.includeInactive && !product.active) return false;
  if (filters.category && product.categorySlug !== filters.category) return false;
  if (filters.categoryId && product.categoryId !== filters.categoryId) return false;
  if (filters.brand && product.brand !== filters.brand) return false;
  if (filters.tag === "best" && !product.isBestSeller) return false;
  if (filters.tag === "new" && !product.isNew) return false;

  if (filters.q) {
    const needle = lower(filters.q);
    const haystack = lower(
      `${product.name} ${product.description} ${product.brand} ${product.categoryName ?? ""}`,
    );
    if (!haystack.includes(needle)) return false;
  }
  return true;
}

function sortProducts(list: Product[], sort?: string) {
  const sorted = [...list];
  switch (sort) {
    case "price_asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price_desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "name":
      return sorted.sort((a, b) => a.name.localeCompare(b.name, "tr-TR"));
    case "newest":
      return sorted; // JSON zaten en yeni önce sırasıyla üretilir
    default:
      return sorted.sort(
        (a, b) => Number(b.isBestSeller) - Number(a.isBestSeller),
      );
  }
}

const EMPTY_ORDERS: OrderRow[] = [];
const EMPTY_ITEMS: OrderItemRow[] = [];

export const jsonProvider: DataProvider = {
  name: "json",
  writable: false,

  settings() {
    return loadCatalog().settings;
  },

  categories(activeOnly = true) {
    const list = loadCatalog().categories;
    return activeOnly ? list.filter((c) => c.active) : list;
  },

  categoryById(id) {
    return loadCatalog().categories.find((c) => c.id === id);
  },

  categoryProductCount(id) {
    return loadCatalog().products.filter((p) => p.categoryId === id).length;
  },

  products(filters = {}) {
    const all = loadCatalog().products.filter((p) => matches(p, filters));
    const sorted = sortProducts(all, filters.sort);
    if (!filters.limit) return sorted;
    const offset = filters.offset || 0;
    return sorted.slice(offset, offset + filters.limit);
  },

  countProducts(filters = {}) {
    return loadCatalog().products.filter((p) => matches(p, filters)).length;
  },

  productBySlug(slug) {
    return loadCatalog().products.find((p) => p.slug === slug && p.active) ?? null;
  },

  productById(id, includeInactive = false) {
    const found = loadCatalog().products.find((p) => p.id === id);
    if (!found) return null;
    return includeInactive || found.active ? found : null;
  },

  brands() {
    const counts = new Map<string, number>();
    for (const product of loadCatalog().products) {
      if (!product.active || !product.brand.trim()) continue;
      counts.set(product.brand, (counts.get(product.brand) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([name, n]) => ({ name, n }))
      .sort((a, b) => a.name.localeCompare(b.name, "tr-TR"));
  },

  // --- Siparişler: demo katalogda sipariş verisi yoktur ---
  dashboardStats(): DashboardStats {
    const catalog = loadCatalog();
    return {
      totalProducts: catalog.products.length,
      activeProducts: catalog.products.filter((p) => p.active).length,
      categories: catalog.categories.length,
      totalOrders: 0,
      openOrders: 0,
      revenueToday: 0,
    };
  },

  recentOrders() {
    return EMPTY_ORDERS;
  },
  orders(_filters?: OrderFilters) {
    return EMPTY_ORDERS;
  },
  orderByNumber() {
    return undefined;
  },
  orderItems() {
    return EMPTY_ITEMS;
  },
  allOrderItems() {
    return EMPTY_ITEMS;
  },
  productOrderCount() {
    return 0;
  },
};
