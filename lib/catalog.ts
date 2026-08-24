import "server-only";
import { brands, categories, categoryBySlug, products, productBySlug, settings } from "@/lib/data";
import type { Product } from "@/lib/types";
import { resolveImageSrc } from "@/lib/product-images";

const normalizeProduct = (product: Product): Product => ({ ...product, mainImage: resolveImageSrc(product.mainImage), images: product.images.map(resolveImageSrc) });

export const getSettings = settings;
export const getCategories = async () => (await categories()).map((category) => ({ ...category, image: resolveImageSrc(category.image) }));
export const getCategoryBySlug = async (slug: string) => { const category = await categoryBySlug(slug); return category ? { ...category, image: resolveImageSrc(category.image) } : undefined; };
export const getProducts = async () => (await products()).map(normalizeProduct);
export const getProductBySlug = async (slug: string) => { const product = await productBySlug(slug); return product ? normalizeProduct(product) : null; };
export const getProductsByCategory = async (slug: string) => (await products({ category: slug })).map(normalizeProduct);
export const getProductsByTag = async (tag: "best" | "new", limit?: number) => (await products({ tag, limit })).map(normalizeProduct);
export const getBrands = brands;
