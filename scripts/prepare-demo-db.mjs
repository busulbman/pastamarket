#!/usr/bin/env node
/**
 * Demo veritabanını deploy'a hazırlar.
 *
 * Yerel geliştirmede veritabanı WAL modunda çalışır; bu modda veriler
 * `-wal` yan dosyasında bekleyebilir ve tek başına kopyalanan `.db` dosyası
 * eksik kalabilir. Ayrıca WAL, salt-okunur açılışta yazılabilir bir dizin
 * gerektirir — Netlify Functions'ta dosya sistemi salt-okunurdur.
 *
 * Bu script:
 *   1. WAL içeriğini ana dosyaya yazar (checkpoint),
 *   2. journal_mode'u "delete" yapar (tek dosya, kendi kendine yeter),
 *   3. VACUUM ile dosyayı küçültür,
 *   4. bütünlük kontrolü yapar ve özet basar.
 *
 * Commit/deploy öncesi çalıştırın: npm run db:prepare-demo
 */
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

const file = path.resolve(
  process.cwd(),
  process.env.SQLITE_DATABASE_PATH || "./data/pastamarket.db",
);

if (!fs.existsSync(file)) {
  console.error(`Veritabanı bulunamadı: ${file}`);
  process.exit(1);
}

const db = new Database(file);
// Çalışan bir dev/start sunucusu dosyayı tutuyorsa kısa süre beklenir.
db.pragma("busy_timeout = 5000");

try {
  db.pragma("wal_checkpoint(TRUNCATE)");
} catch (error) {
  console.error(
    "Veritabanı kilitli. Çalışan `npm run dev` / `npm run start` sürecini kapatıp tekrar deneyin.",
  );
  process.exit(1);
}
db.pragma("journal_mode = delete");
db.exec("VACUUM");

const integrity = db.pragma("integrity_check", { simple: true });
const mode = db.pragma("journal_mode", { simple: true });

const count = (table) =>
  db.prepare(`SELECT COUNT(*) n FROM ${table}`).get().n;

console.log("Demo veritabanı hazırlandı\n");
console.log(`  dosya          : ${path.relative(process.cwd(), file)}`);
console.log(`  boyut          : ${(fs.statSync(file).size / 1024).toFixed(0)} KB`);
console.log(`  journal_mode   : ${mode}`);
console.log(`  bütünlük       : ${integrity}`);
console.log(`  kategori       : ${count("categories")}`);
console.log(`  ürün           : ${count("products")}`);
console.log(`  varyasyon      : ${count("variants")}`);
console.log(`  sipariş        : ${count("orders")}`);

db.close();

// WAL yan dosyaları artık gereksiz.
for (const suffix of ["-wal", "-shm"]) {
  const side = `${file}${suffix}`;
  if (fs.existsSync(side)) {
    fs.unlinkSync(side);
    console.log(`  temizlendi     : ${path.basename(side)}`);
  }
}

if (integrity !== "ok") {
  console.error("\nBütünlük kontrolü başarısız — deploy etmeyin.");
  process.exit(1);
}
