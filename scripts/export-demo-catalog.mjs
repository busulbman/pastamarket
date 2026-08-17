#!/usr/bin/env node
/**
 * SQLite kataloğunu salt-okunur JSON'a çıkarır: data/demo-catalog.json
 *
 * Netlify demo ortamı bu dosyayı okur; better-sqlite3 hiç yüklenmez.
 * Kayıt sayıları koda sabitlenmez — veritabanında ne varsa dışa aktarılır ve
 * yazıldıktan sonra geri okunarak sayılar doğrulanır.
 *
 * Kullanım: npm run demo:export
 */
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

const dbPath = path.resolve(
  process.cwd(),
  process.env.SQLITE_DATABASE_PATH || "./data/pastamarket.db",
);
const outPath = path.resolve(process.cwd(), "./data/demo-catalog.json");

if (!fs.existsSync(dbPath)) {
  console.error(`Veritabanı bulunamadı: ${dbPath}`);
  process.exit(1);
}

const db = new Database(dbPath, { readonly: true, fileMustExist: true });
db.pragma("busy_timeout = 5000");

/** Mağaza tarafında kullanılan ayar anahtarları. Gizli/işletim anahtarları alınmaz. */
const SETTING_KEYS = [
  "brand_name", "tagline", "announcement",
  "phone", "whatsapp", "instagram", "address", "hours",
  "iban", "iban_receiver", "iban_bank",
  "courier_districts", "free_courier_limit", "courier_fee",
  "free_shipping_limit", "shipping_fee", "same_day_cutoff",
  "hero_title", "hero_text", "hero_image", "hero_link",
  "banner_title", "banner_text", "banner_image", "banner_link",
  "page_about", "page_delivery", "page_distance_sales", "page_privacy",
];

const settingRows = db
  .prepare(
    `SELECT key, value FROM settings WHERE key IN (${SETTING_KEYS.map(() => "?").join(",")})`,
  )
  .all(...SETTING_KEYS);
const settings = Object.fromEntries(settingRows.map((r) => [r.key, r.value]));

const categories = db
  .prepare(
    "SELECT id, name, slug, image, active, sort_order FROM categories WHERE active=1 ORDER BY sort_order, name",
  )
  .all();

const productRows = db
  .prepare(
    `SELECT p.id, p.slug, p.name, p.description, p.brand, p.category_id,
            c.name AS category_name, c.slug AS category_slug,
            p.main_image, p.images, p.price, p.sale_price, p.unit,
            p.weight, p.product_type, p.active, p.is_best_seller, p.is_new, p.created_at
     FROM products p
     JOIN categories c ON c.id = p.category_id
     WHERE p.active = 1 AND c.active = 1
     ORDER BY p.is_best_seller DESC, p.created_at DESC, p.id DESC`,
  )
  .all();

const variantRows = db
  .prepare(
    "SELECT id, product_id, name, option_label AS optionLabel, price, sku FROM variants ORDER BY price",
  )
  .all();

const parseImages = (raw) => {
  try {
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
};

const products = productRows.map((row) => ({
  id: row.id,
  slug: row.slug,
  name: row.name,
  description: row.description,
  brand: row.brand || "",
  categoryId: row.category_id,
  categoryName: row.category_name,
  categorySlug: row.category_slug,
  mainImage: row.main_image || "",
  images: parseImages(row.images),
  price: row.price,
  salePrice: row.sale_price,
  unit: row.unit || "adet",
  weight: row.weight || "",
  productType: row.product_type || "",
  active: true,
  isBestSeller: !!row.is_best_seller,
  isNew: !!row.is_new,
  createdAt: row.created_at,
  variants: variantRows
    .filter((v) => v.product_id === row.id)
    .map((v) => ({
      id: v.id,
      name: v.name,
      optionLabel: v.optionLabel,
      price: v.price,
      ...(v.sku ? { sku: v.sku } : {}),
    })),
}));

const catalog = {
  meta: {
    exportedAt: new Date().toISOString(),
    source: path.relative(process.cwd(), dbPath),
    counts: {
      categories: categories.length,
      products: products.length,
      variants: products.reduce((n, p) => n + p.variants.length, 0),
      settings: Object.keys(settings).length,
    },
  },
  settings,
  categories: categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    image: c.image || "",
    active: 1,
    sort_order: c.sort_order,
  })),
  products,
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(catalog, null, 2) + "\n", "utf8");

// --- Doğrulama: dosyayı geri okuyup veritabanıyla karşılaştır ---
const written = JSON.parse(fs.readFileSync(outPath, "utf8"));

const dbCounts = {
  categories: db.prepare("SELECT COUNT(*) n FROM categories WHERE active=1").get().n,
  products: db
    .prepare(
      "SELECT COUNT(*) n FROM products p JOIN categories c ON c.id=p.category_id WHERE p.active=1 AND c.active=1",
    )
    .get().n,
};
db.close();

const problems = [];
if (written.categories.length !== dbCounts.categories) {
  problems.push(
    `kategori: JSON ${written.categories.length} ≠ DB ${dbCounts.categories}`,
  );
}
if (written.products.length !== dbCounts.products) {
  problems.push(`ürün: JSON ${written.products.length} ≠ DB ${dbCounts.products}`);
}
if (written.products.some((p) => !p.slug || typeof p.price !== "number")) {
  problems.push("bazı ürünlerde slug veya fiyat eksik");
}

console.log("Demo kataloğu dışa aktarıldı\n");
console.log(`  dosya      : ${path.relative(process.cwd(), outPath)}`);
console.log(`  boyut      : ${(fs.statSync(outPath).size / 1024).toFixed(0)} KB`);
console.log(`  kategori   : ${written.categories.length}`);
console.log(`  ürün       : ${written.products.length}`);
console.log(`  varyasyon  : ${written.meta.counts.variants}`);
console.log(`  ayar       : ${written.meta.counts.settings}`);

if (problems.length) {
  console.error("\nDoğrulama başarısız:");
  problems.forEach((p) => console.error(`  - ${p}`));
  process.exit(1);
}
console.log("\n  doğrulama  : DB ile birebir eşleşti ✓");
