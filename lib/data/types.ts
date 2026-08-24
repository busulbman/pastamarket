import type { Product, Settings } from "@/lib/types";

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
  sort?: "newest" | "name" | "price_asc" | "price_desc";
  includeInactive?: boolean;
};

export type ProductPage = { products: Product[]; nextCursor: string | null };
export type BulkImportRow = { rowNumber: number; name: string; slug: string; category_slug: string; price: string; compare_at_price: string; brand: string; weight: string; description: string; active: string; image_filename: string };
export type BulkImportResult = { created: number; updated: number; skipped: number; failed: { rowNumber: number; error: string }[] };

export type OrderStatus = "Yeni Sipariş" | "Hazırlanıyor" | "Kargoda" | "Teslim Edildi" | "İptal Edildi";

export type OrderRow = {
  id: number;
  order_number: string;
  idempotency_key: string;
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
  status: OrderStatus;
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

export type ProductInput = Omit<Product, "id" | "categoryName" | "categorySlug" | "variants"> & {
  variants: Omit<Product["variants"][number], "id">[];
};

export type CategoryInput = {
  name: string;
  slug: string;
  image: string;
  sortOrder: number;
  active: boolean;
};

export type CreateOrderInput = Omit<OrderRow, "id" | "created_at" | "status"> & {
  items: Omit<OrderItemRow, "id" | "order_id">[];
};

export interface DataProvider {
  readonly name: "json" | "firestore";
  readonly writable: boolean;
  settings(): Promise<Settings>;
  categories(activeOnly?: boolean): Promise<Category[]>;
  categoryById(id: number): Promise<Category | undefined>;
  categoryBySlug(slug: string): Promise<Category | undefined>;
  categoryProductCount(id: number): Promise<number>;
  products(filters?: ProductFilters): Promise<Product[]>;
  productPage(filters?: ProductFilters & { cursor?: string }): Promise<ProductPage>;
  countProducts(filters?: ProductFilters): Promise<number>;
  productBySlug(slug: string): Promise<Product | null>;
  productById(id: number, includeInactive?: boolean): Promise<Product | null>;
  brands(): Promise<{ name: string; n: number }[]>;
  dashboardStats(): Promise<DashboardStats>;
  recentOrders(limit?: number): Promise<OrderRow[]>;
  orders(filters?: OrderFilters): Promise<OrderRow[]>;
  orderItems(orderId: number): Promise<OrderItemRow[]>;
  allOrderItems(): Promise<OrderItemRow[]>;
  createProduct(input: ProductInput): Promise<number>;
  updateProduct(id: number, input: ProductInput): Promise<void>;
  deleteProduct(id: number): Promise<boolean>;
  setProductActive(id: number, active: boolean): Promise<boolean>;
  createCategory(input: CategoryInput): Promise<number>;
  updateCategory(id: number, input: CategoryInput): Promise<boolean>;
  deleteCategory(id: number): Promise<boolean>;
  setOrderStatus(id: number, status: OrderStatus): Promise<boolean>;
  updateSettings(values: Record<string, string>): Promise<void>;
  createOrder(input: CreateOrderInput): Promise<{ number: string; duplicate: boolean }>;
  bulkImportProducts(rows: BulkImportRow[]): Promise<BulkImportResult>;
  attachProductImage(slug: string, asset: { url: string; publicId: string; width: number; height: number; bytes: number }): Promise<{ oldPublicId?: string }>;
}
