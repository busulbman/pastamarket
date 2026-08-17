import { NextResponse } from "next/server";
import { categoryProductCount, getWrites } from "@/lib/data";
import { badRequest, guardWrite, readJson } from "@/lib/panel-api";
import {
  categorySchema,
  categoryUpdateSchema,
  firstIssue,
  idSchema,
} from "@/lib/panel-schemas";

// better-sqlite3 native bir modüldür; Edge runtime desteklemez.
export const runtime = "nodejs";
// SQLite yalnızca yazma izni olduğunda dinamik olarak yüklenir.
// DATA_PROVIDER=json iken guardWrite() 403 döndürür ve bu import hiç çalışmaz.

export async function POST(request: Request) {
  const denied = await guardWrite();
  if (denied) return denied;

  const writes = await getWrites();

  const parsed = categorySchema.safeParse(await readJson(request));
  if (!parsed.success) return badRequest(firstIssue(parsed.error));
  const input = parsed.data;

  try {
    return NextResponse.json({ id: writes.createCategory(input) });
  } catch {
    return badRequest("Kategori kaydedilemedi. Slug benzersiz olmalıdır.");
  }
}

export async function PATCH(request: Request) {
  const denied = await guardWrite();
  if (denied) return denied;

  const writes = await getWrites();

  const parsed = categoryUpdateSchema.safeParse(await readJson(request));
  if (!parsed.success) return badRequest(firstIssue(parsed.error));
  const input = parsed.data;

  try {
    if (!writes.updateCategory(input.id, input)) {
      return badRequest("Kategori bulunamadı.", 404);
    }
    return NextResponse.json({ ok: true });
  } catch {
    return badRequest("Kategori güncellenemedi. Slug benzersiz olmalıdır.");
  }
}

export async function DELETE(request: Request) {
  const denied = await guardWrite();
  if (denied) return denied;

  const writes = await getWrites();

  const parsed = idSchema.safeParse(await readJson(request));
  if (!parsed.success) return badRequest("Geçersiz kategori.");

  const used = await categoryProductCount(parsed.data.id);
  if (used > 0) {
    return badRequest(
      `Bu kategoride ${used} ürün bulunuyor. Önce ürünleri başka kategoriye taşıyın.`,
      409,
    );
  }

  if (!writes.deleteCategory(parsed.data.id)) {
    return badRequest("Kategori bulunamadı.", 404);
  }

  return NextResponse.json({ ok: true });
}
