import "server-only";
import type { DocumentData } from "firebase-admin/firestore";
import { firestore } from "@/lib/firebase-admin";
import type { Product, Settings, Variant } from "@/lib/types";
import type {
  Category,
  CategoryInput,
  CreateOrderInput,
  DataProvider,
  DashboardStats,
  OrderFilters,
  OrderItemRow,
  OrderRow,
  OrderStatus,
  ProductFilters,
  ProductInput,
} from "@/lib/data/types";

const SITE = "site";
const SYSTEM = "system";
const asNumber = (value: unknown, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const asText = (value: unknown) => typeof value === "string" ? value : "";

function categoryFrom(data: DocumentData): Category {
  return { id: asNumber(data.id), name: asText(data.name), slug: asText(data.slug), image: asText(data.image), active: data.active === false || data.active === 0 ? 0 : 1, sort_order: asNumber(data.sort_order) };
}

function productFrom(data: DocumentData): Product {
  const variants = Array.isArray(data.variants) ? data.variants : [];
  return {
    id: asNumber(data.id), slug: asText(data.slug), name: asText(data.name), description: asText(data.description), brand: asText(data.brand),
    categoryId: asNumber(data.categoryId), categoryName: asText(data.categoryName), categorySlug: asText(data.categorySlug), mainImage: asText(data.mainImage),
    images: Array.isArray(data.images) ? data.images.filter((item): item is string => typeof item === "string") : [], price: asNumber(data.price),
    salePrice: data.salePrice === null || data.salePrice === undefined || data.salePrice === "" ? null : asNumber(data.salePrice), unit: asText(data.unit),
    weight: asText(data.weight), productType: asText(data.productType), active: data.active !== false, isBestSeller: data.isBestSeller === true, isNew: data.isNew === true,
    variants: variants.map((item, index): Variant => ({ id: asNumber(item?.id, index + 1), name: asText(item?.name), optionLabel: asText(item?.optionLabel), price: asNumber(item?.price), sku: asText(item?.sku) || undefined })),
  };
}

function orderFrom(data: DocumentData): OrderRow {
  return {
    id: asNumber(data.id), order_number: asText(data.order_number), idempotency_key: asText(data.idempotency_key), first_name: asText(data.first_name), last_name: asText(data.last_name), phone: asText(data.phone),
    email: asText(data.email) || null, city: asText(data.city), district: asText(data.district), address: asText(data.address), address_note: asText(data.address_note) || null,
    customer_note: asText(data.customer_note) || null, delivery_method: asText(data.delivery_method), payment_method: asText(data.payment_method), subtotal: asNumber(data.subtotal),
    delivery_fee: asNumber(data.delivery_fee), total: asNumber(data.total), status: (asText(data.status) || "Yeni Sipariş") as OrderStatus, created_at: asText(data.created_at),
  };
}

async function nextId(kind: "product" | "category" | "order") {
  const db = firestore();
  return db.runTransaction(async (transaction) => {
    const ref = db.collection("settings").doc(SYSTEM);
    const snapshot = await transaction.get(ref);
    const counters = (snapshot.data()?.counters ?? {}) as Record<string, unknown>;
    const id = asNumber(counters[kind]) + 1;
    transaction.set(ref, { counters: { ...counters, [kind]: id } }, { merge: true });
    return id;
  });
}

function filterProducts(items: Product[], filters: ProductFilters) {
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

async function categoryFor(id: number) {
  const snapshot = await firestore().collection("categories").where("id", "==", id).limit(1).get();
  return snapshot.empty ? undefined : { ref: snapshot.docs[0].ref, value: categoryFrom(snapshot.docs[0].data()) };
}

function productPayload(input: ProductInput, id: number, category: Category, existing?: DocumentData) {
  const variants = input.variants.map((variant, index) => ({ ...variant, id: existing?.variants?.[index]?.id ?? index + 1 }));
  return { ...input, id, categoryName: category.name, categorySlug: category.slug, variants, createdAt: existing?.createdAt ?? new Date().toISOString(), updatedAt: new Date().toISOString() };
}

export const firestoreProvider: DataProvider = {
  name: "firestore",
  writable: true,
  async settings() { const snapshot = await firestore().collection("settings").doc(SITE).get(); return (snapshot.data()?.values ?? {}) as Settings; },
  async categories(activeOnly = true) {
    const snapshot = await firestore().collection("categories").get();
    return snapshot.docs.map((doc) => categoryFrom(doc.data())).filter((item) => !activeOnly || Boolean(item.active)).sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name, "tr-TR"));
  },
  async categoryById(id) { return (await categoryFor(id))?.value; },
  async categoryBySlug(slug) { const result = await firestore().collection("categories").where("slug", "==", slug).limit(1).get(); return result.empty ? undefined : categoryFrom(result.docs[0].data()); },
  async categoryProductCount(id) { const snapshot = await firestore().collection("products").where("categoryId", "==", id).count().get(); return snapshot.data().count; },
  async products(filters = {}) { const snapshot = await firestore().collection("products").get(); const list = filterProducts(snapshot.docs.map((doc) => productFrom(doc.data())), filters); return filters.limit ? list.slice(filters.offset ?? 0, (filters.offset ?? 0) + filters.limit) : list; },
  async countProducts(filters = {}) { return (await this.products(filters)).length; },
  async productBySlug(slug) { const result = await firestore().collection("products").where("slug", "==", slug).limit(1).get(); if (result.empty) return null; const product = productFrom(result.docs[0].data()); return product.active ? product : null; },
  async productById(id, includeInactive = false) { const result = await firestore().collection("products").where("id", "==", id).limit(1).get(); if (result.empty) return null; const product = productFrom(result.docs[0].data()); return includeInactive || product.active ? product : null; },
  async brands() { const counts = new Map<string, number>(); for (const product of await this.products()) if (product.brand) counts.set(product.brand, (counts.get(product.brand) ?? 0) + 1); return [...counts].map(([name, n]) => ({ name, n })).sort((a, b) => a.name.localeCompare(b.name, "tr-TR")); },
  async dashboardStats(): Promise<DashboardStats> {
    const [productList, categoryList, orderList] = await Promise.all([this.products({ includeInactive: true }), this.categories(false), this.orders()]);
    const day = new Date().toISOString().slice(0, 10);
    return { totalProducts: productList.length, activeProducts: productList.filter((item) => item.active).length, categories: categoryList.length, totalOrders: orderList.length, openOrders: orderList.filter((item) => item.status === "Yeni Sipariş" || item.status === "Hazırlanıyor").length, revenueToday: orderList.filter((item) => item.created_at.startsWith(day) && item.status !== "İptal Edildi").reduce((sum, item) => sum + item.total, 0) };
  },
  async recentOrders(limit = 8) { return (await this.orders()).slice(0, limit); },
  async orders(filters: OrderFilters = {}) {
    const snapshot = await firestore().collection("orders").get();
    const query = filters.q?.toLocaleLowerCase("tr-TR").trim();
    return snapshot.docs.map((doc) => orderFrom(doc.data())).filter((order) => (!filters.status || order.status === filters.status) && (!filters.from || order.created_at.slice(0, 10) >= filters.from) && (!filters.to || order.created_at.slice(0, 10) <= filters.to) && (!query || `${order.order_number} ${order.first_name} ${order.last_name} ${order.phone}`.toLocaleLowerCase("tr-TR").includes(query))).sort((a, b) => b.created_at.localeCompare(a.created_at));
  },
  async orderItems(orderId) { const doc = await firestore().collection("orders").doc(`order-${orderId}`).get(); if (!doc.exists) return []; const items = doc.data()?.items; return Array.isArray(items) ? items.map((item, index) => ({ ...item, id: orderId * 1000 + index + 1, order_id: orderId } as OrderItemRow)) : []; },
  async allOrderItems() { const orderList = await this.orders(); return (await Promise.all(orderList.map((order) => this.orderItems(order.id)))).flat(); },
  async createProduct(input) { const category = await categoryFor(input.categoryId); if (!category) throw new Error("Kategori bulunamadı."); const duplicate = await firestore().collection("products").where("slug", "==", input.slug).limit(1).get(); if (!duplicate.empty) throw new Error("Bu slug zaten kullanılıyor."); const id = await nextId("product"); await firestore().collection("products").doc(`product-${id}`).set(productPayload(input, id, category.value)); return id; },
  async updateProduct(id, input) { const category = await categoryFor(input.categoryId); if (!category) throw new Error("Kategori bulunamadı."); const result = await firestore().collection("products").where("id", "==", id).limit(1).get(); if (result.empty) throw new Error("Ürün bulunamadı."); const sameSlug = await firestore().collection("products").where("slug", "==", input.slug).limit(1).get(); if (!sameSlug.empty && sameSlug.docs[0].id !== result.docs[0].id) throw new Error("Bu slug zaten kullanılıyor."); await result.docs[0].ref.set(productPayload(input, id, category.value, result.docs[0].data())); },
  async deleteProduct(id) { const result = await firestore().collection("products").where("id", "==", id).limit(1).get(); if (result.empty) return false; const allOrders = await firestore().collection("orders").get(); if (allOrders.docs.some((doc) => Array.isArray(doc.data().items) && doc.data().items.some((item: { product_id?: number }) => item.product_id === id))) throw new Error("Bu ürün siparişlerde kullanıldığı için silinemez. Pasif yapabilirsiniz."); await result.docs[0].ref.delete(); return true; },
  async setProductActive(id, active) { const result = await firestore().collection("products").where("id", "==", id).limit(1).get(); if (result.empty) return false; await result.docs[0].ref.update({ active, updatedAt: new Date().toISOString() }); return true; },
  async createCategory(input: CategoryInput) { const duplicate = await firestore().collection("categories").where("slug", "==", input.slug).limit(1).get(); if (!duplicate.empty) throw new Error("Bu slug zaten kullanılıyor."); const id = await nextId("category"); await firestore().collection("categories").doc(`category-${id}`).set({ id, name: input.name, slug: input.slug, image: input.image, active: input.active ? 1 : 0, sort_order: input.sortOrder }); return id; },
  async updateCategory(id, input) { const category = await categoryFor(id); if (!category) return false; const duplicate = await firestore().collection("categories").where("slug", "==", input.slug).limit(1).get(); if (!duplicate.empty && duplicate.docs[0].id !== category.ref.id) throw new Error("Bu slug zaten kullanılıyor."); const next = { id, name: input.name, slug: input.slug, image: input.image, active: input.active ? 1 : 0, sort_order: input.sortOrder }; const productRefs = await firestore().collection("products").where("categoryId", "==", id).get(); const batch = firestore().batch(); batch.set(category.ref, next); productRefs.docs.forEach((doc) => batch.update(doc.ref, { categoryName: next.name, categorySlug: next.slug, updatedAt: new Date().toISOString() })); await batch.commit(); return true; },
  async deleteCategory(id) { if (await this.categoryProductCount(id)) return false; const category = await categoryFor(id); if (!category) return false; await category.ref.delete(); return true; },
  async setOrderStatus(id, status) { const ref = firestore().collection("orders").doc(`order-${id}`); if (!(await ref.get()).exists) return false; await ref.update({ status, updatedAt: new Date().toISOString() }); return true; },
  async updateSettings(values) { await firestore().collection("settings").doc(SITE).set({ values, updatedAt: new Date().toISOString() }, { merge: true }); },
  async createOrder(input: CreateOrderInput) {
    const db = firestore();
    const existing = await db.collection("orders").where("idempotency_key", "==", input.idempotency_key).limit(1).get();
    if (!existing.empty) return { number: asText(existing.docs[0].data().order_number), duplicate: true };
    const id = await nextId("order");
    const secondCheck = await db.collection("orders").where("idempotency_key", "==", input.idempotency_key).limit(1).get();
    if (!secondCheck.empty) return { number: asText(secondCheck.docs[0].data().order_number), duplicate: true };
    const number = `PM-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${String(id).padStart(5, "0")}`;
    await db.collection("orders").doc(`order-${id}`).set({ ...input, id, order_number: number, status: "Yeni Sipariş", created_at: new Date().toISOString(), updatedAt: new Date().toISOString() });
    return { number, duplicate: false };
  },
};
