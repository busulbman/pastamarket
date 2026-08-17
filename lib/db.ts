import type DatabaseNamespace from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { config } from "@/lib/config";
import { DEMO_PRODUCTS } from "@/lib/demo-catalog";
import { SANTI_CATEGORIES, SANTI_PRODUCTS } from "@/lib/santi-catalog";
import { productImagePath, resolveImageSrc } from "@/lib/product-images";
import { Product, Settings, Variant } from "@/lib/types";

/**
 * SQLite veri erişim katmanı (DATA_PROVIDER=sqlite).
 *
 * Dışarıya yalnızca fonksiyonlar açılır (products, categories, settings, …).
 * Firestore'a geçilirken bu dosyanın yerine aynı imzalara sahip bir uygulama
 * konur; panel ve mağaza bileşenleri değişmez.
 */

/**
 * better-sqlite3 sürücüsü ÇALIŞMA ZAMANINDA yüklenir.
 *
 * Statik `import` kullanılırsa webpack modülü "external" olarak her sayfa
 * chunk'ına ekler; Next.js'in unstable_preloadEntries adımı bu external'ı
 * değerlendirdiği için native binding, DATA_PROVIDER=json olsa bile sunucu
 * açılışında yüklenir. Netlify Lambda'sında bu yükleme JS hatası üretmeden
 * fonksiyonu çökertiyordu.
 *
 * eval("require") ifadesini webpack statik olarak çözemez; bu yüzden hiçbir
 * chunk'a require("better-sqlite3") girmez. Sürücü yalnızca gerçekten SQLite
 * bağlantısı kurulduğunda (DATA_PROVIDER=sqlite) yüklenir.
 */
type DatabaseCtor = typeof DatabaseNamespace;
type DatabaseInstance = DatabaseNamespace.Database;

let DatabaseImpl: DatabaseCtor | null = null;

function loadDriver(): DatabaseCtor {
  if (!DatabaseImpl) {
    // eslint-disable-next-line no-eval
    const runtimeRequire = eval("require") as NodeRequire;
    DatabaseImpl = runtimeRequire("better-sqlite3") as DatabaseCtor;
  }
  return DatabaseImpl;
}

/**
 * Veritabanı dosyasını bulur.
 *
 * Netlify Functions'ta çalışma dizini yerel geliştirmeden farklı olabildiği
 * için birkaç aday yol denenir (included_files ile paket köküne kopyalanır).
 */
function resolveDatabaseFile() {
  const configured = config.sqlitePath;
  const candidates = [
    path.resolve(process.cwd(), configured),
    path.resolve(process.cwd(), "data/pastamarket.db"),
    // Netlify Functions paket kökü
    path.resolve("/var/task", configured),
    path.resolve("/var/task/data/pastamarket.db"),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }

  if (config.demoReadOnly) {
    throw new Error(
      `Veritabanı bulunamadı. Aranan yollar: ${candidates.join(", ")}. ` +
        "Netlify'da data/pastamarket.db dosyasının included_files ile pakete eklendiğinden emin olun.",
    );
  }

  // Yerel geliştirme: dosya yoksa oluşturulur.
  const target = candidates[0];
  fs.mkdirSync(path.dirname(target), { recursive: true });
  return target;
}

/**
 * Build sırasında mıyız? Next.js "Collecting page data" adımında her sayfa
 * modülünü ayrı worker süreçlerinde import eder. O anda veritabanına ihtiyaç
 * yoktur; yazma da yapılmamalıdır.
 */
const isBuildPhase = () => process.env.NEXT_PHASE === "phase-production-build";

/** Bağlantı salt-okunur mu açılmalı? (canlı demo veya build) */
const openReadOnly = () => config.demoReadOnly || isBuildPhase();

/** Açılışta şema/migration/seed çalıştırılabilir mi? */
const canInitialize = () => !config.demoReadOnly && !isBuildPhase();

type GlobalWithDb = typeof globalThis & { __pastaDb?: DatabaseInstance };
const globalRef = globalThis as GlobalWithDb;

let connection: DatabaseInstance | null = null;

/**
 * Tembel (lazy) bağlantı.
 *
 * ÖNEMLİ: Bu modül import edildiğinde HİÇBİR bağlantı açılmaz, native modül
 * çalıştırılmaz ve yazma yapılmaz. Bağlantı yalnızca ilk gerçek sorguda
 * kurulur. Böylece Next.js build worker'ları (8 paralel süreç) veritabanına
 * hiç dokunmaz.
 *
 * Süreç başına tek bağlantı tutulur; globalThis üzerinden saklandığı için
 * dev sunucusunun sıcak yeniden yüklemelerinde de çoğalmaz.
 */
export function getDb(): DatabaseInstance {
  if (connection) return connection;
  if (globalRef.__pastaDb) {
    connection = globalRef.__pastaDb;
    return connection;
  }

  const file = resolveDatabaseFile();
  const readonly = openReadOnly();

  const Database = loadDriver();
  const instance = new Database(
    file,
    readonly ? { readonly: true, fileMustExist: true } : {},
  );

  instance.pragma("foreign_keys = ON");
  // Kilit görülürse hata vermek yerine kısa süre beklenir.
  instance.pragma("busy_timeout = 10000");

  // journal_mode değişikliği bir YAZMA işlemidir; salt-okunur bağlantıda
  // çalıştırılamaz. Zaten WAL ise tekrar yazılmaz.
  if (!readonly) {
    const mode = instance.pragma("journal_mode", { simple: true });
    if (mode !== "wal") instance.pragma("journal_mode = WAL");
  }

  // Bağlantıyı önce yayınla: initialize() içindeki sorgular getDb() çağırırsa
  // sonsuz döngüye girilmesin.
  connection = instance;
  globalRef.__pastaDb = instance;

  if (canInitialize()) initialize();
  else if (config.demoReadOnly) {
    console.info("[PastaMarket] Demo salt-okunur mod: açılış yazımları atlandı.");
  }

  return instance;
}

/**
 * Geriye dönük uyumluluk için `db` erişimi.
 * Özellik okunduğu anda bağlantı kurulur (import anında değil).
 */
export const db = new Proxy({} as DatabaseInstance, {
  get(_target, property, receiver) {
    const instance = getDb();
    const value = Reflect.get(instance, property, instance);
    return typeof value === "function" ? value.bind(instance) : value;
  },
  has: (_target, property) => property in getDb(),
});

function ensureSchema() {
  db.exec(`
  CREATE TABLE IF NOT EXISTS admins (id INTEGER PRIMARY KEY, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
  CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY, name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, image TEXT, active INTEGER DEFAULT 1, sort_order INTEGER DEFAULT 0);
  CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY, slug TEXT UNIQUE NOT NULL, name TEXT NOT NULL, description TEXT NOT NULL, brand TEXT DEFAULT '', category_id INTEGER NOT NULL, main_image TEXT, images TEXT DEFAULT '[]', price REAL NOT NULL, sale_price REAL, unit TEXT DEFAULT 'adet', active INTEGER DEFAULT 1, is_best_seller INTEGER DEFAULT 0, is_new INTEGER DEFAULT 0, created_at TEXT DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(category_id) REFERENCES categories(id));
  CREATE TABLE IF NOT EXISTS variants (id INTEGER PRIMARY KEY, product_id INTEGER NOT NULL, name TEXT NOT NULL, option_label TEXT NOT NULL, price REAL NOT NULL, sku TEXT, FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE);
  CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY, order_number TEXT UNIQUE NOT NULL, idempotency_key TEXT UNIQUE, first_name TEXT NOT NULL, last_name TEXT NOT NULL, phone TEXT NOT NULL, email TEXT, city TEXT NOT NULL, district TEXT NOT NULL, address TEXT NOT NULL, address_note TEXT, customer_note TEXT, delivery_method TEXT NOT NULL, payment_method TEXT NOT NULL, subtotal REAL NOT NULL, delivery_fee REAL NOT NULL, total REAL NOT NULL, status TEXT NOT NULL DEFAULT 'Yeni Sipariş', created_at TEXT DEFAULT CURRENT_TIMESTAMP);
  CREATE TABLE IF NOT EXISTS order_items (id INTEGER PRIMARY KEY, order_id INTEGER NOT NULL, product_id INTEGER NOT NULL, product_name TEXT NOT NULL, image TEXT, variant_id INTEGER, variant_label TEXT, unit_price REAL NOT NULL, quantity INTEGER NOT NULL, line_total REAL NOT NULL, FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE);
  `);
}

/** Şema eklemeleri (idempotent). */
function addColumnIfMissing(table: string, column: string, definition: string) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all() as {
    name: string;
  }[];
  if (!columns.some((c) => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

function migrate() {
  addColumnIfMissing("products", "weight", "TEXT DEFAULT ''");
  addColumnIfMissing("products", "product_type", "TEXT DEFAULT ''");
  
  // Liste, filtre ve sıralama sorgularının tarama yapmaması için indeksler.
  db.exec(`
  CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
  CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
  CREATE INDEX IF NOT EXISTS idx_products_best ON products(is_best_seller, active);
  CREATE INDEX IF NOT EXISTS idx_products_new ON products(is_new, active);
  CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
  CREATE INDEX IF NOT EXISTS idx_products_created ON products(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_variants_product ON variants(product_id);
  CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
  CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
  `);
}

const CATEGORY_SEED = [
  ["Çikolata", "cikolata"],
  ["Krema ve Dolgu", "krema-ve-dolgu"],
  ["Şeker Hamuru", "seker-hamuru"],
  ["Kalıp ve Ekipman", "kalip-ve-ekipman"],
  ["Süsleme Ürünleri", "susleme-urunleri"],
  ["Ambalaj Ürünleri", "ambalaj-urunleri"],
  ["Gıda Boyaları", "gida-boyalari"],
] as const;

/**
 * Sitede görünen tüm metin ve işletme bilgileri ayar olarak tutulur.
 * İletişim, IBAN ve sözleşme metinleri bilerek boştur; girilmeden
 * arayüzde hiç gösterilmezler.
 */
const DEFAULT_SETTINGS: Settings = {
  brand_name: "PastaMarket",
  tagline: "Pastacılığın tüm ihtiyaçları tek adreste",
  announcement:
    "Belirli İstanbul ilçelerine aynı gün teslimat! Saat 14.00’a kadar verilen siparişler gün içinde kapınızda.",
  phone: "",
  whatsapp: "",
  address: "",
  hours: "",
  instagram: "",
  iban_receiver: "",
  iban_bank: "",
  iban: "",
  courier_districts:
    "Arnavutköy,Bağcılar,Başakşehir,Bayrampaşa,Beşiktaş,Beyoğlu,Esenler,Eyüpsultan,Fatih,Gaziosmanpaşa,Sultangazi,Zeytinburnu",
  free_courier_limit: "2500",
  courier_fee: "120",
  free_shipping_limit: "3500",
  shipping_fee: "149",
  same_day_cutoff: "14:00",
  hero_title: "Pasta Malzemelerinde Aynı Gün Teslimat!",
  hero_text:
    "Saat 14.00’a kadar verdiğiniz siparişler, belirlenen ilçelerde aynı gün kapınızda.",
  hero_image: "",
  hero_link: "/urunler",
  banner_title: "Pastacılığa Dair Her Şey",
  banner_text:
    "Profesyonel pastacılık ürünlerinden hobi malzemelerine kadar aradığınız her şey PastaMarket’te!",
  banner_image: "",
  banner_link: "/urunler",
  page_about: "",
  page_delivery: "",
  page_distance_sales: "",
  page_privacy: "",
};

const CONTENT_VERSION = "2";
const CONTENT_KEYS = [
  "tagline",
  "announcement",
  "hero_title",
  "hero_text",
  "hero_link",
  "banner_title",
  "banner_text",
  "banner_link",
] as const;

/** Demo kataloğu sürümü; artırıldığında örnek ürünler yenilenir. */
const CATALOG_VERSION = "4";

/**
 * İşletmenin tek iletişim numarası. Sürüm artırıldığında bir kez yazılır;
 * sonradan panelden değiştirilirse üzerine yazılmaz.
 * Instagram hesabı henüz yok — boş bırakılır, panelden girilince görünür.
 */
const CONTACT_VERSION = "1";
const CONTACT_SETTINGS: Settings = {
  phone: "+90 544 586 89 33",
  whatsapp: "905445868933",
};

const PLACEHOLDER_VALUES: Record<string, string[]> = {
  phone: ["0212 000 00 00"],
  whatsapp: ["905000000000"],
  address: ["İstanbul, Türkiye"],
  iban: ["TR00 0000 0000 0000 0000 0000 00"],
  iban_bank: ["Örnek Banka"],
  iban_receiver: ["PastaMarket Ödeme Hesabı"],
};

function seedCategories() {
  // Kategori görselleri panelden yüklenir; boşken placeholder gösterilir.
  const addCategory = db.prepare(
    "INSERT OR IGNORE INTO categories (name,slug,image,sort_order) VALUES (?,?,'',?)",
  );
  CATEGORY_SEED.forEach((c, i) => addCategory.run(c[0], c[1], i));
}

/**
 * Örnek katalog kurulumu.
 *
 * Yalnızca otomatik üretilmiş demo kayıtları ("… Seçkisi 001") temizlenir ve
 * gerçekçi örnek ürünlerle değiştirilir. Elle eklenmiş ürünlere ve siparişi
 * bulunan hiçbir kayda dokunulmaz.
 */
function seedDemoCatalog() {
  const categoryIds = Object.fromEntries(
    (db.prepare("SELECT id,slug FROM categories").all() as {
      id: number;
      slug: string;
    }[]).map((c) => [c.slug, c.id]),
  );

  const removable = db
    .prepare(
      `SELECT id FROM products
       WHERE brand = 'PastaMarket Seçki' AND name LIKE '% Seçkisi %'
         AND id NOT IN (SELECT DISTINCT product_id FROM order_items)`,
    )
    .all() as { id: number }[];

  const deleteVariants = db.prepare("DELETE FROM variants WHERE product_id=?");
  const deleteProduct = db.prepare("DELETE FROM products WHERE id=?");
  removable.forEach((row) => {
    deleteVariants.run(row.id);
    deleteProduct.run(row.id);
  });

  const insertProduct = db.prepare(
    `INSERT OR IGNORE INTO products
     (slug,name,description,brand,category_id,main_image,images,price,sale_price,unit,weight,product_type,active,is_best_seller,is_new)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,1,?,?)`,
  );
  const insertVariant = db.prepare(
    "INSERT INTO variants (product_id,name,option_label,price) VALUES (?,?,?,?)",
  );

  for (const item of DEMO_PRODUCTS) {
    const categoryId = categoryIds[item.categorySlug];
    if (!categoryId) continue;

    const result = insertProduct.run(
      item.slug,
      item.name,
      item.description,
      item.brand,
      categoryId,
      productImagePath(item.slug),
      JSON.stringify([productImagePath(item.slug)]),
      item.price,
      item.salePrice ?? null,
      item.unit,
      item.weight,
      item.productType,
      item.isBestSeller ? 1 : 0,
      item.isNew ? 1 : 0,
    );

    if (result.changes && item.variants?.length) {
      const productId = Number(result.lastInsertRowid);
      item.variants.forEach((variant) =>
        insertVariant.run(productId, variant.name, variant.optionLabel, variant.price),
      );
    }
  }
}

/**
 * Şanti / krema kataloğunu slug bazlı olarak ekler veya günceller.
 *
 * Tamamen idempotenttir: aynı slug ikinci kez çalıştırıldığında yeni kayıt
 * açmaz, mevcut kaydın ad, kategori, fiyat ve görselini günceller.
 * Verilmeyen alanlar (gramaj, açıklama, indirimli fiyat, rozet, varyasyon)
 * yeni kayıtlarda boş/null bırakılır ve güncellemede ellenmez.
 */
export function syncSantiCatalog() {
  const upsertCategory = db.prepare(
    `INSERT INTO categories (name,slug,image,active,sort_order)
     VALUES (?,?,'',1,?)
     ON CONFLICT(slug) DO UPDATE SET name=excluded.name, active=1`,
  );

  const nextSort =
    ((db.prepare("SELECT COALESCE(MAX(sort_order),0) n FROM categories").get() as {
      n: number;
    }).n) + 1;

  const insertProduct = db.prepare(
    `INSERT INTO products
     (slug,name,description,brand,category_id,main_image,images,price,sale_price,unit,weight,product_type,active,is_best_seller,is_new)
     VALUES (?,?,'','',?,?,?,?,NULL,'adet','','',1,0,0)`,
  );
  // Yalnızca verilen alanlar güncellenir; açıklama/gramaj/rozet korunur.
  const updateProduct = db.prepare(
    `UPDATE products
     SET name=?, category_id=?, main_image=?, images=?, price=?, active=1
     WHERE slug=?`,
  );

  return db.transaction(() => {
    SANTI_CATEGORIES.forEach((category, index) =>
      upsertCategory.run(category.name, category.slug, nextSort + index),
    );

    const categoryIds = Object.fromEntries(
      (db.prepare("SELECT id,slug FROM categories").all() as {
        id: number;
        slug: string;
      }[]).map((c) => [c.slug, c.id]),
    );

    let created = 0;
    let updated = 0;

    for (const product of SANTI_PRODUCTS) {
      const categoryId = categoryIds[product.categorySlug];
      if (!categoryId) continue;

      const images = JSON.stringify([product.image]);
      const existing = db
        .prepare("SELECT id FROM products WHERE slug=?")
        .get(product.slug) as { id: number } | undefined;

      if (existing) {
        updateProduct.run(
          product.name,
          categoryId,
          product.image,
          images,
          product.price,
          product.slug,
        );
        updated += 1;
      } else {
        insertProduct.run(
          product.slug,
          product.name,
          categoryId,
          product.image,
          images,
          product.price,
        );
        created += 1;
      }
    }

    return { created, updated };
  })();
}

/**
 * Veritabanında kalmış dış kaynaklı (Unsplash) görsel adreslerini temizler.
 * Ürünlerde slug'a karşılık gelen yerel yola, diğerlerinde boşa çevrilir.
 */
function clearRemoteImages() {
  // Önce salt-okunur kontrol: temizlenecek bir şey yoksa hiç yazma yapılmaz.
  // (Her sunucu/worker açılışında gereksiz yazma kilidi almamak için.)
  const pending = (
    db
      .prepare(
        `SELECT
           (SELECT COUNT(*) FROM products WHERE main_image LIKE 'http%' OR images LIKE '%http%')
         + (SELECT COUNT(*) FROM categories WHERE image LIKE 'http%')
         + (SELECT COUNT(*) FROM settings WHERE key IN ('hero_image','banner_image') AND value LIKE 'http%') AS n`,
      )
      .get() as { n: number }
  ).n;
  if (!pending) return;

  db.transaction(() => {
    const stale = db
      .prepare(
        "SELECT id,slug FROM products WHERE main_image LIKE 'http%' OR images LIKE '%http%'",
      )
      .all() as { id: number; slug: string }[];

    const update = db.prepare("UPDATE products SET main_image=?, images=? WHERE id=?");
    stale.forEach((row) => {
      const local = productImagePath(row.slug);
      update.run(local, JSON.stringify([local]), row.id);
    });

    db.prepare("UPDATE categories SET image='' WHERE image LIKE 'http%'").run();
    db.prepare(
      "UPDATE settings SET value='' WHERE key IN ('hero_image','banner_image') AND value LIKE 'http%'",
    ).run();
  })();
}

function bootstrap() {
  const isFirstRun = !(
    db.prepare("SELECT COUNT(*) as count FROM settings").get() as { count: number }
  ).count;

  // Yapılacak iş var mı? Salt-okunur kontrol ile karar verilir; yoksa hiç
  // yazma işlemi başlatılmaz. Build sırasında paralel çalışan worker'ların
  // birbirini "database is locked" ile düşürmesini önler.
  const existing = settings();
  const needsWork =
    isFirstRun ||
    existing.contact_version !== CONTACT_VERSION ||
    existing.content_version !== CONTENT_VERSION ||
    existing.catalog_version !== CATALOG_VERSION ||
    Object.keys(DEFAULT_SETTINGS).some((key) => !(key in existing)) ||
    Object.entries(PLACEHOLDER_VALUES).some(([key, fakes]) =>
      fakes.includes((existing[key] ?? "").trim()),
    );

  if (!needsWork) {
    clearRemoteImages();
    return;
  }

  const putIfMissing = db.prepare(
    "INSERT OR IGNORE INTO settings (key,value) VALUES (?,?)",
  );
  const putSetting = db.prepare(
    "INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
  );

  db.transaction(() => {
    Object.entries(DEFAULT_SETTINGS).forEach(([key, value]) =>
      putIfMissing.run(key, value),
    );

    if (isFirstRun) seedCategories();

    const current = settings();

    // Örnek olarak yazılmış sahte iletişim bilgilerini bir defaya mahsus temizle.
    Object.entries(PLACEHOLDER_VALUES).forEach(([key, fakes]) => {
      if (fakes.includes((current[key] ?? "").trim())) putSetting.run(key, "");
    });

    if (current.contact_version !== CONTACT_VERSION) {
      Object.entries(CONTACT_SETTINGS).forEach(([key, value]) =>
        putSetting.run(key, value),
      );
      putSetting.run("contact_version", CONTACT_VERSION);
    }

    if (current.content_version !== CONTENT_VERSION) {
      CONTENT_KEYS.forEach((key) => putSetting.run(key, DEFAULT_SETTINGS[key]));
      putSetting.run("content_version", CONTENT_VERSION);
    }

    if (current.catalog_version !== CATALOG_VERSION) {
      seedCategories();
      seedDemoCatalog();
      // Şanti kataloğu yalnızca sürüm değiştiğinde senkronlanır; böylece
      // panelden yapılan düzenlemeler her sunucu başlangıcında ezilmez.
      syncSantiCatalog();
      putSetting.run("catalog_version", CATALOG_VERSION);
    }
  })();

  // Dış kaynaklı görsel adresi kalmadığından emin olmak için her açılışta
  // çalışır; ilk temizlikten sonra eşleşen kayıt bulunmaz.
  clearRemoteImages();
}

export function settings(): Settings {
  const rows = db.prepare("SELECT key,value FROM settings").all() as {
    key: string;
    value: string;
  }[];
  return Object.fromEntries(rows.map((row) => [row.key, row.value]));
}

export function updateSettings(values: Record<string, unknown>) {
  const put = db.prepare(
    "INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
  );
  db.transaction(() => {
    Object.entries(values).forEach(([key, value]) => put.run(key, String(value ?? "")));
  })();
}

export type Category = {
  id: number;
  name: string;
  slug: string;
  image: string;
  active: number;
  sort_order: number;
};

export function categories(activeOnly = true) {
  const rows = db
    .prepare(
      `SELECT * FROM categories ${activeOnly ? "WHERE active=1" : ""} ORDER BY sort_order,name`,
    )
    .all() as Category[];
  return rows.map((row) => ({ ...row, image: resolveImageSrc(row.image) }));
}

export function categoryById(id: number) {
  return db.prepare("SELECT * FROM categories WHERE id=?").get(id) as
    | Category
    | undefined;
}

/** Kategoride kaç ürün olduğu (silme uyarısı için). */
export function categoryProductCount(id: number) {
  return (
    db.prepare("SELECT COUNT(*) n FROM products WHERE category_id=?").get(id) as {
      n: number;
    }
  ).n;
}

type ProductRow = {
  id: number;
  slug: string;
  name: string;
  description: string;
  brand: string;
  category_id: number;
  category_name?: string;
  category_slug?: string;
  main_image: string;
  images: string;
  price: number;
  sale_price: number | null;
  unit: string;
  weight: string | null;
  product_type: string | null;
  active: number;
  is_best_seller: number;
  is_new: number;
};

/**
 * Sık kullanılan sorgu, bağlantı başına bir kez hazırlanır.
 * Modül seviyesinde prepare edilmez; aksi hâlde import anında bağlantı açılırdı.
 */
let variantsStatement: DatabaseNamespace.Statement | null = null;
let variantsStatementOwner: DatabaseInstance | null = null;

function variantsOf(productId: number) {
  const instance = getDb();
  if (!variantsStatement || variantsStatementOwner !== instance) {
    variantsStatement = instance.prepare(
      "SELECT id,name,option_label as optionLabel,price,sku FROM variants WHERE product_id=? ORDER BY price",
    );
    variantsStatementOwner = instance;
  }
  return variantsStatement.all(productId) as Variant[];
}

function productFrom(row: ProductRow): Product {
  let images: string[] = [];
  try {
    const parsed = JSON.parse(row.images || "[]");
    if (Array.isArray(parsed)) images = parsed.filter((x) => typeof x === "string");
  } catch {
    images = [];
  }

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    brand: row.brand,
    categoryId: row.category_id,
    categoryName: row.category_name,
    categorySlug: row.category_slug,
    // Görseller burada tek noktada çözülür: dosya yoksa placeholder gelir,
    // böylece hiçbir bileşen var olmayan bir yola istek göndermez.
    mainImage: resolveImageSrc(row.main_image),
    images: images.map(resolveImageSrc),
    price: row.price,
    salePrice: row.sale_price,
    unit: row.unit,
    weight: row.weight || "",
    productType: row.product_type || "",
    active: !!row.active,
    isBestSeller: !!row.is_best_seller,
    isNew: !!row.is_new,
    variants: variantsOf(row.id),
  };
}

const productSelect =
  "SELECT p.*, c.name category_name, c.slug category_slug FROM products p JOIN categories c ON c.id=p.category_id";

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

function buildWhere(filters: ProductFilters) {
  const clauses: string[] = [];
  const args: (string | number)[] = [];

  if (!filters.includeInactive) clauses.push("p.active=1");
  if (filters.category) {
    clauses.push("c.slug=?");
    args.push(filters.category);
  }
  if (filters.categoryId) {
    clauses.push("p.category_id=?");
    args.push(filters.categoryId);
  }
  if (filters.brand) {
    clauses.push("p.brand=?");
    args.push(filters.brand);
  }
  if (filters.q) {
    clauses.push("(p.name LIKE ? OR p.description LIKE ? OR p.brand LIKE ? OR c.name LIKE ?)");
    args.push(...Array(4).fill(`%${filters.q}%`));
  }
  if (filters.tag) {
    clauses.push(filters.tag === "best" ? "p.is_best_seller=1" : "p.is_new=1");
  }

  return {
    where: clauses.length ? ` WHERE ${clauses.join(" AND ")}` : "",
    args,
  };
}

function orderBy(sort?: string) {
  switch (sort) {
    case "price_asc":
      return "p.price ASC";
    case "price_desc":
      return "p.price DESC";
    case "name":
      return "p.name ASC";
    case "newest":
      return "p.created_at DESC, p.id DESC";
    default:
      return "p.is_best_seller DESC, p.created_at DESC, p.id DESC";
  }
}

export function products(filters: ProductFilters = {}) {
  const { where, args } = buildWhere(filters);
  let sql = `${productSelect}${where} ORDER BY ${orderBy(filters.sort)}`;
  if (filters.limit) {
    sql += " LIMIT ? OFFSET ?";
    args.push(filters.limit, filters.offset || 0);
  }
  return (db.prepare(sql).all(...args) as ProductRow[]).map(productFrom);
}

export function countProducts(filters: ProductFilters = {}) {
  const { where, args } = buildWhere(filters);
  const row = db
    .prepare(
      `SELECT COUNT(*) n FROM products p JOIN categories c ON c.id=p.category_id${where}`,
    )
    .get(...args) as { n: number };
  return row.n;
}

export function brands() {
  return db
    .prepare(
      "SELECT p.brand name, COUNT(*) n FROM products p WHERE p.active=1 AND trim(coalesce(p.brand,''))<>'' GROUP BY p.brand ORDER BY p.brand",
    )
    .all() as { name: string; n: number }[];
}

export function productBySlug(slug: string) {
  const row = db
    .prepare(`${productSelect} WHERE p.slug=? AND p.active=1`)
    .get(slug) as ProductRow | undefined;
  return row ? productFrom(row) : null;
}

export function productById(id: number, includeInactive = false) {
  const row = db
    .prepare(
      `${productSelect} WHERE p.id=?${includeInactive ? "" : " AND p.active=1"}`,
    )
    .get(id) as ProductRow | undefined;
  return row ? productFrom(row) : null;
}

/** Panel kontrol paneli özeti. */
export function dashboardStats() {
  const one = (sql: string) => (db.prepare(sql).get() as { n: number }).n || 0;
  return {
    totalProducts: one("SELECT COUNT(*) n FROM products"),
    activeProducts: one("SELECT COUNT(*) n FROM products WHERE active=1"),
    categories: one("SELECT COUNT(*) n FROM categories"),
    totalOrders: one("SELECT COUNT(*) n FROM orders"),
    openOrders: one(
      "SELECT COUNT(*) n FROM orders WHERE status IN ('Yeni Sipariş','Hazırlanıyor')",
    ),
    revenueToday: one(
      "SELECT COALESCE(SUM(total),0) n FROM orders WHERE date(created_at)=date('now','localtime') AND status<>'İptal Edildi'",
    ),
  };
}

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

export function recentOrders(limit = 8) {
  return db
    .prepare("SELECT * FROM orders ORDER BY created_at DESC, id DESC LIMIT ?")
    .all(limit) as OrderRow[];
}

export type OrderFilters = { q?: string; status?: string; from?: string; to?: string };

export function orders(filters: OrderFilters = {}) {
  const clauses: string[] = [];
  const args: string[] = [];

  if (filters.status) {
    clauses.push("status=?");
    args.push(filters.status);
  }
  if (filters.q) {
    clauses.push(
      "(order_number LIKE ? OR first_name LIKE ? OR last_name LIKE ? OR phone LIKE ?)",
    );
    args.push(...Array(4).fill(`%${filters.q}%`));
  }
  if (filters.from) {
    clauses.push("date(created_at) >= date(?)");
    args.push(filters.from);
  }
  if (filters.to) {
    clauses.push("date(created_at) <= date(?)");
    args.push(filters.to);
  }

  const where = clauses.length ? ` WHERE ${clauses.join(" AND ")}` : "";
  return db
    .prepare(`SELECT * FROM orders${where} ORDER BY created_at DESC, id DESC`)
    .all(...args) as OrderRow[];
}

export function orderByNumber(orderNumber: string) {
  return db.prepare("SELECT * FROM orders WHERE order_number=?").get(orderNumber) as
    | OrderRow
    | undefined;
}

export function orderItems(orderId: number) {
  return db
    .prepare("SELECT * FROM order_items WHERE order_id=?")
    .all(orderId) as OrderItemRow[];
}

export function allOrderItems() {
  return db.prepare("SELECT * FROM order_items").all() as OrderItemRow[];
}

/** Ürün siparişlerde kullanılmış mı? Silme öncesi kontrol için. */
export function productOrderCount(productId: number) {
  return (
    db
      .prepare("SELECT COUNT(*) n FROM order_items WHERE product_id=?")
      .get(productId) as { n: number }
  ).n;
}

/**
 * Şema ve indeksler güncel mi? (salt-okunur kontrol)
 *
 * DDL ifadeleri "IF NOT EXISTS" olsa bile yazma kilidi alır. Build sırasında
 * paralel çalışan Next.js worker'ları bu yüzden birbirini
 * "database is locked" ile düşürebiliyordu; hiçbir şey değişmeyecekse
 * DDL hiç çalıştırılmaz.
 */
function schemaIsCurrent() {
  try {
    const objects = db
      .prepare("SELECT name FROM sqlite_master WHERE type IN ('table','index')")
      .all() as { name: string }[];
    const names = new Set(objects.map((row) => row.name));

    const required = [
      "admins", "categories", "products", "variants", "settings", "orders", "order_items",
      "idx_products_category", "idx_products_active", "idx_products_best",
      "idx_products_new", "idx_products_brand", "idx_products_created",
      "idx_variants_product", "idx_order_items_order", "idx_orders_created",
      "idx_orders_status",
    ];
    if (required.some((name) => !names.has(name))) return false;

    const columns = (db.prepare("PRAGMA table_info(products)").all() as { name: string }[]).map(
      (c) => c.name,
    );
    return columns.includes("weight") && columns.includes("product_type");
  } catch {
    return false;
  }
}

/**
 * Açılış işlemleri (şema, migration, seed).
 *
 * Yalnızca yazılabilir ortamda ve ilk gerçek bağlantı kurulduğunda çalışır.
 * Canlı demoda (DEMO_READ_ONLY=true) ve Next.js build aşamasında hiç
 * çağrılmaz — bkz. canInitialize().
 */
function initialize() {
  if (!schemaIsCurrent()) {
    ensureSchema();
    migrate();
  }
  bootstrap();
}
