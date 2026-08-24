import "server-only";
import type { Category, BulkImportRow } from "@/lib/data";

export const CSV_COLUMNS = ["name", "slug", "category_slug", "price", "compare_at_price", "brand", "weight", "description", "active", "image_filename"] as const;

function rowsOf(text: string) {
  const rows: string[][] = []; let row: string[] = []; let value = ""; let quoted = false;
  for (let index = 0; index < text.length; index++) { const char = text[index]; if (char === '"') { if (quoted && text[index + 1] === '"') { value += '"'; index++; } else quoted = !quoted; } else if (char === "," && !quoted) { row.push(value); value = ""; } else if ((char === "\n" || char === "\r") && !quoted) { if (char === "\r" && text[index + 1] === "\n") index++; row.push(value); if (row.some((cell) => cell.trim())) rows.push(row); row = []; value = ""; } else value += char; }
  row.push(value); if (row.some((cell) => cell.trim())) rows.push(row); return rows;
}

export function parseProductCsv(text: string): BulkImportRow[] {
  const rows = rowsOf(text.replace(/^\uFEFF/, "")); if (!rows.length) throw new Error("CSV dosyası boş.");
  const header = rows[0].map((value) => value.trim()); const missing = CSV_COLUMNS.filter((column) => !header.includes(column)); if (missing.length) throw new Error(`CSV sütunları eksik: ${missing.join(", ")}`);
  return rows.slice(1).map((cells, index) => ({
    rowNumber: index + 2,
    name: cells[header.indexOf("name")]?.trim() ?? "",
    slug: cells[header.indexOf("slug")]?.trim() ?? "",
    category_slug: cells[header.indexOf("category_slug")]?.trim() ?? "",
    price: cells[header.indexOf("price")]?.trim() ?? "",
    compare_at_price: cells[header.indexOf("compare_at_price")]?.trim() ?? "",
    brand: cells[header.indexOf("brand")]?.trim() ?? "",
    weight: cells[header.indexOf("weight")]?.trim() ?? "",
    description: cells[header.indexOf("description")]?.trim() ?? "",
    active: cells[header.indexOf("active")]?.trim() ?? "",
    image_filename: cells[header.indexOf("image_filename")]?.trim() ?? "",
  }));
}

export function validateCsvRows(rows: BulkImportRow[], categories: Category[]) {
  const categorySlugs = new Set(categories.map((category) => category.slug)); const seen = new Set<string>();
  return rows.map((row) => { const errors: string[] = []; const slug = row.slug.trim(); const price = Number(row.price.replace(",", ".")); if (!row.name.trim()) errors.push("Ürün adı zorunludur."); if (!/^[a-z0-9-]{2,200}$/.test(slug)) errors.push("Slug küçük harf, rakam ve tire içermelidir."); if (seen.has(slug)) errors.push("CSV içinde aynı slug tekrar ediyor."); seen.add(slug); if (!categorySlugs.has(row.category_slug.trim())) errors.push("Kategori slug'ı Firestore kategorilerinde bulunamadı."); if (!Number.isFinite(price) || price < 0) errors.push("Fiyat geçerli bir sayı olmalıdır."); if (row.compare_at_price && (!Number.isFinite(Number(row.compare_at_price.replace(",", "."))) || Number(row.compare_at_price.replace(",", ".")) < 0)) errors.push("Karşılaştırma fiyatı geçersiz."); if (row.active && !["1", "0", "true", "false", "evet", "hayır", "yes", "no"].includes(row.active.toLocaleLowerCase("tr-TR"))) errors.push("active alanı true/false veya 1/0 olmalıdır."); return { ...row, errors }; });
}
