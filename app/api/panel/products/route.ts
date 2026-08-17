import { NextResponse } from "next/server";
import { getWrites, productOrderCount } from "@/lib/data";
import { badRequest, guardWrite, readJson } from "@/lib/panel-api";
import {
  firstIssue,
  idSchema,
  productSchema,
  productUpdateSchema,
} from "@/lib/panel-schemas";

// better-sqlite3 native bir modüldür; Edge runtime desteklemez.
export const runtime = "nodejs";
// SQLite yalnızca yazma izni olduğunda dinamik olarak yüklenir.
// DATA_PROVIDER=json iken guardWrite() 403 döndürür ve bu import hiç çalışmaz.

type ProductInput = ReturnType<typeof productSchema.parse>;

export async function POST(request: Request) {
  const denied = await guardWrite();
  if (denied) return denied;

  const writes = await getWrites();

  const parsed = productSchema.safeParse(await readJson(request));
  if (!parsed.success) return badRequest(firstIssue(parsed.error));
  const input = parsed.data;

  try {
    return NextResponse.json({ id: writes.createProduct(input) });
  } catch {
    return badRequest("Ürün kaydedilemedi. Slug benzersiz ve kategori geçerli olmalı.");
  }
}

export async function PATCH(request: Request) {
  const denied = await guardWrite();
  if (denied) return denied;

  const writes = await getWrites();

  const parsed = productUpdateSchema.safeParse(await readJson(request));
  if (!parsed.success) return badRequest(firstIssue(parsed.error));
  const input = parsed.data;

  if (!writes.productExists(input.id)) return badRequest("Ürün bulunamadı.", 404);

  try {
    writes.updateProduct(input.id, input);
    return NextResponse.json({ ok: true });
  } catch {
    return badRequest("Ürün güncellenemedi. Slug benzersiz ve kategori geçerli olmalı.");
  }
}

export async function DELETE(request: Request) {
  const denied = await guardWrite();
  if (denied) return denied;

  const writes = await getWrites();

  const parsed = idSchema.safeParse(await readJson(request));
  if (!parsed.success) return badRequest("Geçersiz ürün.");

  const name = writes.productName(parsed.data.id);
  if (!name) return badRequest("Ürün bulunamadı.", 404);

  // Siparişi olan ürün silinmez; sipariş geçmişi bozulmasın diye pasife alınır.
  if ((await productOrderCount(parsed.data.id)) > 0) {
    return badRequest(
      "Bu ürün siparişlerde kullanıldığı için silinemez. Bunun yerine pasif yapabilirsiniz.",
      409,
    );
  }

  writes.deleteProduct(parsed.data.id);
  return NextResponse.json({ ok: true });
}
