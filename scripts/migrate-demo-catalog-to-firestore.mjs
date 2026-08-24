#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const required = ["FIREBASE_PROJECT_ID", "FIREBASE_CLIENT_EMAIL", "FIREBASE_PRIVATE_KEY"];
const missing = required.filter((key) => !process.env[key]?.trim());
if (missing.length) {
  console.error(`Firestore migration yapılandırması eksik: ${missing.join(", ")}`);
  process.exit(1);
}

const privateKey = process.env.FIREBASE_PRIVATE_KEY.trim().replace(/\\n/g, "\n");
const app = getApps()[0] ?? initializeApp({ credential: cert({ projectId: process.env.FIREBASE_PROJECT_ID.trim(), clientEmail: process.env.FIREBASE_CLIENT_EMAIL.trim(), privateKey }), projectId: process.env.FIREBASE_PROJECT_ID.trim() });
const db = getFirestore(app);
const marker = db.collection("settings").doc("migrations");
const markerSnapshot = await marker.get();
if (markerSnapshot.data()?.demoCatalogV1?.completedAt) {
  console.log("Demo katalog daha önce Firestore'a aktarıldı; yeni kayıt oluşturulmadı.");
  process.exit(0);
}

const catalogPath = path.resolve(process.cwd(), "data/demo-catalog.json");
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
const maxProductId = Math.max(0, ...catalog.products.map((item) => Number(item.id) || 0));
const maxCategoryId = Math.max(0, ...catalog.categories.map((item) => Number(item.id) || 0));
const batch = db.batch();

for (const category of catalog.categories) {
  batch.set(db.collection("categories").doc(`category-${category.id}`), {
    id: Number(category.id), name: category.name, slug: category.slug, image: category.image || "", active: category.active ? 1 : 0, sort_order: Number(category.sort_order) || 0,
  }, { merge: true });
}
for (const product of catalog.products) {
  batch.set(db.collection("products").doc(`product-${product.id}`), {
    ...product,
    id: Number(product.id),
    variants: (product.variants ?? []).map((variant, index) => ({ ...variant, id: Number(variant.id) || index + 1 })),
    createdAt: product.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }, { merge: true });
}
batch.set(db.collection("settings").doc("site"), { values: catalog.settings ?? {}, updatedAt: new Date().toISOString() }, { merge: true });
batch.set(db.collection("settings").doc("system"), { counters: { category: maxCategoryId, product: maxProductId, order: 0 } }, { merge: true });
batch.set(marker, { demoCatalogV1: { completedAt: new Date().toISOString(), categories: catalog.categories.length, products: catalog.products.length } }, { merge: true });
await batch.commit();
console.log(`Demo katalog aktarıldı: ${catalog.categories.length} kategori, ${catalog.products.length} ürün.`);
