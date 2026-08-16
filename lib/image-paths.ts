/**
 * Görsel yolu sabitleri ve saf yardımcılar.
 *
 * Bu dosya dosya sistemine erişmez; hem sunucu hem istemci bileşenlerinden
 * güvenle import edilebilir. Diskte var olma kontrolü için sunucuya özel
 * `lib/product-images.ts` kullanılır.
 */

export const PRODUCT_PLACEHOLDER = "/images/product-placeholder.svg";
export const PRODUCT_IMAGE_DIR = "/images/products";

/** Yerel (public/ altındaki) bir yol mu? */
export const isLocalPath = (src?: string | null) =>
  Boolean(src && src.trim().startsWith("/"));

/** Ürün slug'ından beklenen yerel görsel yolu. */
export const productImagePath = (slug: string) => `${PRODUCT_IMAGE_DIR}/${slug}.jpg`;

/** Sorgu parametresi ve hash'i temizlenmiş yol. */
export const cleanImagePath = (src: string) => src.split("?")[0].split("#")[0];
