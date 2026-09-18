import type { Product } from "@/lib/types";

/**
 * Sunucu (Firestore/JSON provider) ve istemci (ProductList) aynı eşleştirme
 * kurallarını kullansın diye arama mantığı tek yerde tutulur.
 */

const TURKISH_MAP: Record<string, string> = { ç: "c", ş: "s", ğ: "g", ü: "u", ö: "o", ı: "i" };

/** "  MAT  Fıstık " → "mat fistik"; İ/I/ı → i, ç → c, ş → s, ğ → g, ü → u, ö → o. */
export function normalizeSearchText(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .replace(/[çşğüöı]/g, (char) => TURKISH_MAP[char])
    // "İ".toLocaleLowerCase("tr-TR") → "i"; diğer dillerden gelen birleşik
    // işaretler (â, î, i̇ …) aksansız hâline indirgenir.
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export const searchTerms = (query: string) => normalizeSearchText(query).split(" ").filter(Boolean);

function productSearchText(product: Product) {
  return normalizeSearchText(
    [
      product.name,
      product.brand,
      product.categoryName,
      product.categorySlug?.replace(/-/g, " "),
      product.description,
      product.productType,
      product.weight,
      product.slug.replace(/-/g, " "),
      ...product.variants.flatMap((variant) => [variant.name, variant.optionLabel, variant.sku]),
    ]
      .filter(Boolean)
      .join(" "),
  );
}

/** Sorgudaki her kelime ürünün aranabilir alanlarından birinde geçmelidir (kısmi eşleşme). */
export function matchesSearch(product: Product, query: string) {
  const terms = searchTerms(query);
  if (!terms.length) return true;
  const haystack = productSearchText(product);
  return terms.every((term) => haystack.includes(term));
}

/** Ürün adında eşleşenler açıklamada eşleşenlerden önce listelenir. */
export function searchScore(product: Product, query: string) {
  const phrase = normalizeSearchText(query);
  const name = normalizeSearchText(product.name);
  if (!phrase) return 0;
  if (name === phrase) return 4;
  if (name.startsWith(phrase)) return 3;
  if (name.includes(phrase)) return 2;
  return searchTerms(query).every((term) => name.includes(term)) ? 1 : 0;
}
