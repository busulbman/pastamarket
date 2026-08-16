import { NextResponse } from "next/server";
import { db, productOrderCount } from "@/lib/db";
import { badRequest, guardWrite, readJson } from "@/lib/panel-api";
import {
  firstIssue,
  idSchema,
  productSchema,
  productUpdateSchema,
} from "@/lib/panel-schemas";

// better-sqlite3 native bir modüldür; Edge runtime desteklemez.
export const runtime = "nodejs";

type ProductInput = ReturnType<typeof productSchema.parse>;

function writeVariants(productId: number, variants: ProductInput["variants"]) {
  db.prepare("DELETE FROM variants WHERE product_id=?").run(productId);
  const insert = db.prepare(
    "INSERT INTO variants (product_id,name,option_label,price) VALUES (?,?,?,?)",
  );
  variants.forEach((variant) =>
    insert.run(productId, variant.name, variant.optionLabel, variant.price),
  );
}

export async function POST(request: Request) {
  const denied = await guardWrite();
  if (denied) return denied;

  const parsed = productSchema.safeParse(await readJson(request));
  if (!parsed.success) return badRequest(firstIssue(parsed.error));
  const input = parsed.data;

  try {
    const result = db.transaction(() => {
      const inserted = db
        .prepare(
          `INSERT INTO products
           (slug,name,description,brand,category_id,main_image,images,price,sale_price,unit,weight,product_type,active,is_best_seller,is_new)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        )
        .run(
          input.slug,
          input.name,
          input.description,
          input.brand,
          input.categoryId,
          input.mainImage,
          JSON.stringify(input.images),
          input.price,
          input.salePrice,
          input.unit || "adet",
          input.weight,
          input.productType,
          input.active ? 1 : 0,
          input.isBestSeller ? 1 : 0,
          input.isNew ? 1 : 0,
        );
      const id = Number(inserted.lastInsertRowid);
      writeVariants(id, input.variants);
      return id;
    })();

    return NextResponse.json({ id: result });
  } catch {
    return badRequest("Ürün kaydedilemedi. Slug benzersiz ve kategori geçerli olmalı.");
  }
}

export async function PATCH(request: Request) {
  const denied = await guardWrite();
  if (denied) return denied;

  const parsed = productUpdateSchema.safeParse(await readJson(request));
  if (!parsed.success) return badRequest(firstIssue(parsed.error));
  const input = parsed.data;

  const exists = db.prepare("SELECT id FROM products WHERE id=?").get(input.id);
  if (!exists) return badRequest("Ürün bulunamadı.", 404);

  try {
    db.transaction(() => {
      db.prepare(
        `UPDATE products SET slug=?,name=?,description=?,brand=?,category_id=?,main_image=?,
         images=?,price=?,sale_price=?,unit=?,weight=?,product_type=?,active=?,is_best_seller=?,is_new=?
         WHERE id=?`,
      ).run(
        input.slug,
        input.name,
        input.description,
        input.brand,
        input.categoryId,
        input.mainImage,
        JSON.stringify(input.images),
        input.price,
        input.salePrice,
        input.unit || "adet",
        input.weight,
        input.productType,
        input.active ? 1 : 0,
        input.isBestSeller ? 1 : 0,
        input.isNew ? 1 : 0,
        input.id,
      );
      writeVariants(input.id, input.variants);
    })();

    return NextResponse.json({ ok: true });
  } catch {
    return badRequest("Ürün güncellenemedi. Slug benzersiz ve kategori geçerli olmalı.");
  }
}

export async function DELETE(request: Request) {
  const denied = await guardWrite();
  if (denied) return denied;

  const parsed = idSchema.safeParse(await readJson(request));
  if (!parsed.success) return badRequest("Geçersiz ürün.");

  const product = db
    .prepare("SELECT id,name FROM products WHERE id=?")
    .get(parsed.data.id) as { id: number; name: string } | undefined;
  if (!product) return badRequest("Ürün bulunamadı.", 404);

  // Siparişi olan ürün silinmez; sipariş geçmişi bozulmasın diye pasife alınır.
  if (productOrderCount(product.id) > 0) {
    return badRequest(
      "Bu ürün siparişlerde kullanıldığı için silinemez. Bunun yerine pasif yapabilirsiniz.",
      409,
    );
  }

  db.transaction(() => {
    db.prepare("DELETE FROM variants WHERE product_id=?").run(product.id);
    db.prepare("DELETE FROM products WHERE id=?").run(product.id);
  })();

  return NextResponse.json({ ok: true });
}
