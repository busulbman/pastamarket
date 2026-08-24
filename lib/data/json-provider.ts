import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { Product, Settings } from "@/lib/types";
import type {
  Category,
  CreateOrderInput,
  DataProvider,
  DashboardStats,
  OrderFilters,
  OrderItemRow,
  OrderRow,
  ProductFilters,
} from "@/lib/data/types";

type Catalog = { settings: Settings; categories: Category[]; products: Product[] };
let catalog: Catalog | null = null;

function load() {
  if (catalog) return catalog;
  const file = path.resolve(process.cwd(), "data/demo-catalog.json");
  const parsed = JSON.parse(fs.readFileSync(file, "utf8")) as Catalog;
  catalog = { settings: parsed.settings ?? {}, categories: parsed.categories ?? [], products: parsed.products ?? [] };
  return catalog;
}

function filterProducts(items: Product[], filters: ProductFilters = {}) {
  const query = filters.q?.toLocaleLowerCase("tr-TR").trim();
  const list = items.filter((product) => {
    if (!filters.includeInactive && !product.active) return false;
    if (filters.category && product.categorySlug !== filters.category) return false;
    if (filters.categoryId && product.categoryId !== filters.categoryId) return false;
    if (filters.brand && product.brand !== filters.brand) return false;
    if (filters.tag === "best" && !product.isBestSeller) return false;
    if (filters.tag === "new" && !product.isNew) return false;
    return !query || `${product.name} ${product.description} ${product.brand}`.toLocaleLowerCase("tr-TR").includes(query);
  });
  return [...list].sort((a, b) => {
    if (filters.sort === "price_asc") return a.price - b.price;
    if (filters.sort === "price_desc") return b.price - a.price;
    if (filters.sort === "name") return a.name.localeCompare(b.name, "tr-TR");
    return Number(b.isBestSeller) - Number(a.isBestSeller);
  });
}

const readOnly = (action: string) => Promise.reject(new Error(`JSON demo modunda ${action} yapılamaz.`));

export const jsonProvider: DataProvider = {
  name: "json",
  writable: false,
  async settings() { return load().settings; },
  async categories(activeOnly = true) { return load().categories.filter((item) => !activeOnly || Boolean(item.active)); },
  async categoryById(id) { return load().categories.find((item) => item.id === id); },
  async categoryBySlug(slug) { return load().categories.find((item) => item.slug === slug); },
  async categoryProductCount(id) { return load().products.filter((item) => item.categoryId === id).length; },
  async products(filters = {}) { const list = filterProducts(load().products, filters); return filters.limit ? list.slice(filters.offset ?? 0, (filters.offset ?? 0) + filters.limit) : list; },
  async countProducts(filters = {}) { return filterProducts(load().products, filters).length; },
  async productBySlug(slug) { return load().products.find((item) => item.slug === slug && item.active) ?? null; },
  async productById(id, includeInactive = false) { const product = load().products.find((item) => item.id === id) ?? null; return product && (includeInactive || product.active) ? product : null; },
  async brands() {
    const counts = new Map<string, number>();
    for (const product of load().products) if (product.active && product.brand) counts.set(product.brand, (counts.get(product.brand) ?? 0) + 1);
    return [...counts].map(([name, n]) => ({ name, n })).sort((a, b) => a.name.localeCompare(b.name, "tr-TR"));
  },
  async dashboardStats(): Promise<DashboardStats> { const data = load(); return { totalProducts: data.products.length, activeProducts: data.products.filter((item) => item.active).length, categories: data.categories.length, totalOrders: 0, openOrders: 0, revenueToday: 0 }; },
  async recentOrders(): Promise<OrderRow[]> { return []; },
  async orders(_filters?: OrderFilters): Promise<OrderRow[]> { return []; },
  async orderItems(_orderId: number): Promise<OrderItemRow[]> { return []; },
  async allOrderItems(): Promise<OrderItemRow[]> { return []; },
  createProduct: () => readOnly("ürün ekleme"), updateProduct: () => readOnly("ürün güncelleme"), deleteProduct: () => readOnly("ürün silme"), setProductActive: () => readOnly("ürün durumu değiştirme"), createCategory: () => readOnly("kategori ekleme"), updateCategory: () => readOnly("kategori güncelleme"), deleteCategory: () => readOnly("kategori silme"), setOrderStatus: () => readOnly("sipariş durumu değiştirme"), updateSettings: () => readOnly("ayar güncelleme"), createOrder: (_input: CreateOrderInput) => readOnly("sipariş oluşturma"),
};
