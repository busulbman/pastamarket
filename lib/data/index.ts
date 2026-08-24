import "server-only";
import { unstable_cache } from "next/cache";
import { config } from "@/lib/config";
import type { DataProvider, ProductFilters } from "@/lib/data/types";

export * from "@/lib/data/types";

let providerPromise: Promise<DataProvider> | undefined;
export function getProvider() {
  providerPromise ??= config.dataProvider === "firestore"
    ? import("@/lib/data/firestore-provider").then((module) => module.firestoreProvider)
    : import("@/lib/data/json-provider").then((module) => module.jsonProvider);
  return providerPromise;
}

export const providerName = config.dataProvider;
export const providerWritable = config.dataProvider === "firestore";

const cachedSettings = unstable_cache(async () => (await getProvider()).settings(), ["catalog-settings"], { revalidate: 300, tags: ["catalog"] });
const cachedCategories = unstable_cache(async () => (await getProvider()).categories(true), ["catalog-categories"], { revalidate: 300, tags: ["catalog"] });
const cachedProducts = unstable_cache(async () => (await getProvider()).products(), ["catalog-products"], { revalidate: 300, tags: ["catalog"] });

export const settings = cachedSettings;
export const categories = async (activeOnly = true) => activeOnly ? cachedCategories() : (await getProvider()).categories(false);
export const products = async (filters: ProductFilters = {}) => Object.keys(filters).length ? (await getProvider()).products(filters) : cachedProducts();
export const productPage = async (filters: ProductFilters & { cursor?: string } = {}) => (await getProvider()).productPage(filters);
export const countProducts = async (filters: ProductFilters = {}) => (await getProvider()).countProducts(filters);
export const categoryById = async (id: number) => (await getProvider()).categoryById(id);
export const categoryBySlug = async (slug: string) => (await getProvider()).categoryBySlug(slug);
export const categoryProductCount = async (id: number) => (await getProvider()).categoryProductCount(id);
export const productBySlug = async (slug: string) => (await getProvider()).productBySlug(slug);
export const productById = async (id: number, includeInactive = false) => (await getProvider()).productById(id, includeInactive);
export const brands = async () => (await getProvider()).brands();
export const dashboardStats = async () => (await getProvider()).dashboardStats();
export const recentOrders = async (limit = 8) => (await getProvider()).recentOrders(limit);
export const orders = async (filters = {}) => (await getProvider()).orders(filters);
export const orderItems = async (id: number) => (await getProvider()).orderItems(id);
export const allOrderItems = async () => (await getProvider()).allOrderItems();
export const writes = async () => { const provider = await getProvider(); if (!provider.writable) throw new Error("Bu modda veri yazma kapalıdır."); return provider; };
