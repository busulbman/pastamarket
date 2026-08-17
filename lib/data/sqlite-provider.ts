import * as sqlite from "@/lib/db";
import type {
  DataProvider,
  ProductInput,
  WritableDataProvider,
} from "@/lib/data/types";

/**
 * SQLite sağlayıcı (DATA_PROVIDER=sqlite) — yerel geliştirme içindir.
 *
 * Bu dosya yalnızca dinamik import ile yüklenir. DATA_PROVIDER=json iken
 * hiç import edilmez, dolayısıyla better-sqlite3 native binding'i de yüklenmez.
 * Mevcut lib/db.ts kodu korunur; Firebase geçişine kadar aynen kullanılır.
 */
export const sqliteProvider: DataProvider = {
  name: "sqlite",
  writable: true,

  settings: sqlite.settings,
  categories: sqlite.categories,
  categoryById: sqlite.categoryById,
  categoryProductCount: sqlite.categoryProductCount,

  products: sqlite.products,
  countProducts: sqlite.countProducts,
  productBySlug: sqlite.productBySlug,
  productById: sqlite.productById,
  brands: sqlite.brands,

  dashboardStats: sqlite.dashboardStats,
  recentOrders: sqlite.recentOrders,
  orders: sqlite.orders,
  orderByNumber: sqlite.orderByNumber,
  orderItems: sqlite.orderItems,
  allOrderItems: sqlite.allOrderItems,
  productOrderCount: sqlite.productOrderCount,
};

/** Yazma yetenekleri — yalnızca SQLite sağlayıcıda bulunur. */
export const sqliteWrites: Omit<WritableDataProvider, keyof DataProvider> = {
  createProduct(input) {
    const { db } = sqlite;
    return db.transaction(() => {
      const inserted = db
        .prepare(
          `INSERT INTO products
           (slug,name,description,brand,category_id,main_image,images,price,sale_price,unit,weight,product_type,active,is_best_seller,is_new)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        )
        .run(
          input.slug, input.name, input.description, input.brand, input.categoryId,
          input.mainImage, JSON.stringify(input.images), input.price, input.salePrice,
          input.unit || "adet", input.weight, input.productType,
          input.active ? 1 : 0, input.isBestSeller ? 1 : 0, input.isNew ? 1 : 0,
        );
      const id = Number(inserted.lastInsertRowid);
      writeVariants(id, input.variants);
      return id;
    })();
  },

  updateProduct(id, input) {
    const { db } = sqlite;
    db.transaction(() => {
      db.prepare(
        `UPDATE products SET slug=?,name=?,description=?,brand=?,category_id=?,main_image=?,
         images=?,price=?,sale_price=?,unit=?,weight=?,product_type=?,active=?,is_best_seller=?,is_new=?
         WHERE id=?`,
      ).run(
        input.slug, input.name, input.description, input.brand, input.categoryId,
        input.mainImage, JSON.stringify(input.images), input.price, input.salePrice,
        input.unit || "adet", input.weight, input.productType,
        input.active ? 1 : 0, input.isBestSeller ? 1 : 0, input.isNew ? 1 : 0, id,
      );
      writeVariants(id, input.variants);
    })();
  },

  deleteProduct(id) {
    const { db } = sqlite;
    db.transaction(() => {
      db.prepare("DELETE FROM variants WHERE product_id=?").run(id);
      db.prepare("DELETE FROM products WHERE id=?").run(id);
    })();
  },

  setProductActive(id, active) {
    return (
      sqlite.db
        .prepare("UPDATE products SET active=? WHERE id=?")
        .run(active ? 1 : 0, id).changes > 0
    );
  },

  productExists(id) {
    return Boolean(sqlite.db.prepare("SELECT id FROM products WHERE id=?").get(id));
  },

  productName(id) {
    const row = sqlite.db
      .prepare("SELECT name FROM products WHERE id=?")
      .get(id) as { name: string } | undefined;
    return row?.name ?? null;
  },

  createCategory(input) {
    const result = sqlite.db
      .prepare("INSERT INTO categories (name,slug,image,active,sort_order) VALUES (?,?,?,?,?)")
      .run(input.name, input.slug, input.image, input.active ? 1 : 0, input.sortOrder);
    return Number(result.lastInsertRowid);
  },

  updateCategory(id, input) {
    return (
      sqlite.db
        .prepare("UPDATE categories SET name=?,slug=?,image=?,active=?,sort_order=? WHERE id=?")
        .run(input.name, input.slug, input.image, input.active ? 1 : 0, input.sortOrder, id)
        .changes > 0
    );
  },

  deleteCategory(id) {
    return sqlite.db.prepare("DELETE FROM categories WHERE id=?").run(id).changes > 0;
  },

  setOrderStatus(id, status) {
    return (
      sqlite.db.prepare("UPDATE orders SET status=? WHERE id=?").run(status, id).changes > 0
    );
  },

  updateSettings: sqlite.updateSettings,
};

function writeVariants(
  productId: number,
  variants: ProductInput["variants"],
) {
  const { db } = sqlite;
  db.prepare("DELETE FROM variants WHERE product_id=?").run(productId);
  const insert = db.prepare(
    "INSERT INTO variants (product_id,name,option_label,price) VALUES (?,?,?,?)",
  );
  variants.forEach((v) => insert.run(productId, v.name, v.optionLabel, v.price));
}
