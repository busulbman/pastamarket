import type { Product, Settings } from "@/lib/types";

/**
 * Veri sağlayıcı arayüzü.
 *
 * ÖNEMLİ: Bu dosya ve bunu import eden hiçbir ortak modül better-sqlite3'ü
 * top-level import ETMEZ. SQLite sağlayıcısı yalnızca DATA_PROVIDER=sqlite
 * iken dinamik import ile yüklenir (bkz. lib/data/index.ts).
 */

export type Category = {
  id: number;
  name: string;
  slug: string;
  image: string;
  active: number;
  sort_order: number;
};

export type ProductFilters = {
  category?: string;
  categoryId?: number;
  brand?: string;
  q?: string;
  tag?: "best" | "new";
  limit?: number;
  offset?: number;
  sort?: string;
  includeInactive?: boolean;
};

export type OrderRow = {
  id: number;
  order_number: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string | null;
  city: string;
  district: string;
  address: string;
  address_note: string | null;
  customer_note: string | null;
  delivery_method: string;
  payment_method: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: string;
  created_at: string;
};

export type OrderItemRow = {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  image: string | null;
  variant_id: number | null;
  variant_label: string | null;
  unit_price: number;
  quantity: number;
  line_total: number;
};

export type OrderFilters = { q?: string; status?: string; from?: string; to?: string };

export type DashboardStats = {
  totalProducts: number;
  activeProducts: number;
  categories: number;
  totalOrders: number;
  openOrders: number;
  revenueToday: number;
};

export type ProductInput = {
  name: string;
  slug: string;
  description: string;
  brand: string;
  categoryId: number;
  mainImage: string;
  images: string[];
  price: number;
  salePrice: number | null;
  unit: string;
  weight: string;
  productType: string;
  active: boolean;
  isBestSeller: boolean;
  isNew: boolean;
  variants: { name: string; optionLabel: string; price: number }[];
};

export type CategoryInput = {
  name: string;
  slug: string;
  image: string;
  sortOrder: number;
  active: boolean;
};

/**
 * Yazma yetenekleri yalnızca yazılabilir sağlayıcıda bulunur.
 * Panel route'ları bunları @/lib/data üzerinden çağırır; böylece route
 * dosyalarında @/lib/db veya better-sqlite3 referansı bulunmaz.
 */
export interface WritableDataProvider extends DataProvider {
  createProduct(input: ProductInput): number;
  updateProduct(id: number, input: ProductInput): void;
  deleteProduct(id: number): void;
  setProductActive(id: number, active: boolean): boolean;
  productExists(id: number): boolean;
  productName(id: number): string | null;

  createCategory(input: CategoryInput): number;
  updateCategory(id: number, input: CategoryInput): boolean;
  deleteCategory(id: number): boolean;

  setOrderStatus(id: number, status: string): boolean;
  updateSettings(values: Record<string, unknown>): void;
}

export interface DataProvider {
  readonly name: "sqlite" | "json";
  /** Sipariş yazımı ve panel düzenlemesi destekleniyor mu? */
  readonly writable: boolean;

  settings(): Settings;
  categories(activeOnly?: boolean): Category[];
  categoryById(id: number): Category | undefined;
  categoryProductCount(id: number): number;

  products(filters?: ProductFilters): Product[];
  countProducts(filters?: ProductFilters): number;
  productBySlug(slug: string): Product | null;
  productById(id: number, includeInactive?: boolean): Product | null;
  brands(): { name: string; n: number }[];

  dashboardStats(): DashboardStats;
  recentOrders(limit?: number): OrderRow[];
  orders(filters?: OrderFilters): OrderRow[];
  orderByNumber(orderNumber: string): OrderRow | undefined;
  orderItems(orderId: number): OrderItemRow[];
  allOrderItems(): OrderItemRow[];
  productOrderCount(productId: number): number;
}
