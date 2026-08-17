import { config } from "@/lib/config";
import type {
  Category,
  DashboardStats,
  DataProvider,
  OrderFilters,
  OrderItemRow,
  OrderRow,
  ProductFilters,
} from "@/lib/data/types";
import type { Product, Settings } from "@/lib/types";

export type {
  Category,
  DashboardStats,
  DataProvider,
  OrderFilters,
  OrderItemRow,
  OrderRow,
  ProductFilters,
};

/**
 * Aktif veri sağlayıcısı.
 *
 * DATA_PROVIDER=json  → salt-okunur JSON (Netlify demo). better-sqlite3'e hiç
 *                       dokunulmaz; sqlite-provider modülü import bile edilmez.
 * DATA_PROVIDER=sqlite → yerel geliştirme (varsayılan).
 *
 * Seçim dinamik import ile yapılır; böylece kullanılmayan sağlayıcı ayrı bir
 * chunk'ta kalır ve çalıştırılmaz.
 */
let providerPromise: Promise<DataProvider> | null = null;

export function getProvider(): Promise<DataProvider> {
  if (!providerPromise) {
    providerPromise =
      config.dataProvider === "json"
        ? import("@/lib/data/json-provider").then((m) => m.jsonProvider)
        : import("@/lib/data/sqlite-provider").then((m) => m.sqliteProvider);
  }
  return providerPromise;
}

/** Sağlayıcı adı — bağlantı açmadan okunabilir. */
export const providerName = config.dataProvider;

/** Bu ortamda veri yazılabilir mi? (JSON demo salt-okunurdur) */
export const providerWritable = config.dataProvider !== "json";

// --- Sayfa ve route'ların kullandığı yardımcılar ---

export async function settings(): Promise<Settings> {
  return (await getProvider()).settings();
}

export async function categories(activeOnly = true): Promise<Category[]> {
  return (await getProvider()).categories(activeOnly);
}

export async function categoryById(id: number): Promise<Category | undefined> {
  return (await getProvider()).categoryById(id);
}

export async function categoryProductCount(id: number): Promise<number> {
  return (await getProvider()).categoryProductCount(id);
}

export async function products(filters: ProductFilters = {}): Promise<Product[]> {
  return (await getProvider()).products(filters);
}

export async function countProducts(filters: ProductFilters = {}): Promise<number> {
  return (await getProvider()).countProducts(filters);
}

export async function productBySlug(slug: string): Promise<Product | null> {
  return (await getProvider()).productBySlug(slug);
}

export async function productById(
  id: number,
  includeInactive = false,
): Promise<Product | null> {
  return (await getProvider()).productById(id, includeInactive);
}

export async function brands(): Promise<{ name: string; n: number }[]> {
  return (await getProvider()).brands();
}

export async function dashboardStats(): Promise<DashboardStats> {
  return (await getProvider()).dashboardStats();
}

export async function recentOrders(limit = 8): Promise<OrderRow[]> {
  return (await getProvider()).recentOrders(limit);
}

export async function orders(filters: OrderFilters = {}): Promise<OrderRow[]> {
  return (await getProvider()).orders(filters);
}

export async function orderByNumber(
  orderNumber: string,
): Promise<OrderRow | undefined> {
  return (await getProvider()).orderByNumber(orderNumber);
}

export async function orderItems(orderId: number): Promise<OrderItemRow[]> {
  return (await getProvider()).orderItems(orderId);
}

export async function allOrderItems(): Promise<OrderItemRow[]> {
  return (await getProvider()).allOrderItems();
}

export async function productOrderCount(productId: number): Promise<number> {
  return (await getProvider()).productOrderCount(productId);
}

/**
 * Yazma işlemleri. Yalnızca yazılabilir sağlayıcıda kullanılabilir.
 * SQLite modülü burada, dinamik import ile yüklenir; JSON modunda bu fonksiyon
 * hiç çağrılmaz (panel route'ları önce guardWrite ile 403 döner).
 */
export async function getWrites() {
  if (!providerWritable) {
    throw new Error("Bu ortamda veri yazma kapalıdır.");
  }
  const { sqliteWrites } = await import("@/lib/data/sqlite-provider");
  return sqliteWrites;
}
