import fs from "node:fs";
import path from "node:path";
import {
  cleanImagePath,
  isLocalPath,
  PRODUCT_PLACEHOLDER,
  productImagePath,
} from "@/lib/image-paths";

/**
 * SUNUCUYA ÖZEL görsel çözümleyici (dosya sistemine erişir).
 *
 * Yalnızca sunucu modüllerinden import edilmelidir (lib/db.ts, server
 * component'ler). İstemci bileşenleri saf sabitler için `lib/image-paths.ts`
 * kullanır.
 *
 * Dosya diskte yoksa placeholder döndürülür; böylece tarayıcıya hiçbir zaman
 * var olmayan bir yol gönderilmez ve 404 / yeniden deneme döngüsü oluşmaz.
 * Dış kaynaklı (Unsplash vb.) adreslere istek yapılmadan placeholder'a düşülür.
 */

const PUBLIC_DIR = path.join(process.cwd(), "public");

/** Diske sürekli stat atmamak için kısa ömürlü önbellek. */
const CACHE_TTL_MS = 10_000;
const cache = new Map<string, { exists: boolean; checkedAt: number }>();

function fileExists(publicPath: string) {
  const now = Date.now();
  const cached = cache.get(publicPath);
  if (cached && now - cached.checkedAt < CACHE_TTL_MS) return cached.exists;

  // Yol her zaman public/ içinde kalmalı (path traversal koruması).
  const target = path.resolve(PUBLIC_DIR, `.${publicPath}`);
  const relative = path.relative(PUBLIC_DIR, target);
  const safe = Boolean(relative) && !relative.startsWith("..") && !path.isAbsolute(relative);

  let exists = false;
  if (safe) {
    try {
      exists = fs.statSync(target).isFile();
    } catch {
      exists = false;
    }
  }

  cache.set(publicPath, { exists, checkedAt: now });
  return exists;
}

/**
 * Verilen kaynağı görüntülenebilir bir yola çevirir.
 * Güvenli HTTPS URL'leri (örn. ImgBB) doğrudan korur; yerel yollarda dosya
 * varlığı denetlenir.
 */
export function resolveImageSrc(src?: string | null): string {
  const value = (src ?? "").trim();
  if (/^https:\/\//i.test(value)) return value;
  if (!value || !isLocalPath(value)) return PRODUCT_PLACEHOLDER;

  const cleaned = cleanImagePath(value);
  return fileExists(cleaned) ? cleaned : PRODUCT_PLACEHOLDER;
}

/** Görselin gerçekten mevcut olup olmadığı. */
export const hasImage = (src?: string | null) =>
  resolveImageSrc(src) !== PRODUCT_PLACEHOLDER;

export { PRODUCT_PLACEHOLDER, productImagePath };
