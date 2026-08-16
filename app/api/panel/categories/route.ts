import { NextResponse } from "next/server";
import { categoryProductCount, db } from "@/lib/db";
import { badRequest, guardWrite, readJson } from "@/lib/panel-api";
import {
  categorySchema,
  categoryUpdateSchema,
  firstIssue,
  idSchema,
} from "@/lib/panel-schemas";

// better-sqlite3 native bir modüldür; Edge runtime desteklemez.
export const runtime = "nodejs";

export async function POST(request: Request) {
  const denied = await guardWrite();
  if (denied) return denied;

  const parsed = categorySchema.safeParse(await readJson(request));
  if (!parsed.success) return badRequest(firstIssue(parsed.error));
  const input = parsed.data;

  try {
    const result = db
      .prepare(
        "INSERT INTO categories (name,slug,image,active,sort_order) VALUES (?,?,?,?,?)",
      )
      .run(input.name, input.slug, input.image, input.active ? 1 : 0, input.sortOrder);
    return NextResponse.json({ id: Number(result.lastInsertRowid) });
  } catch {
    return badRequest("Kategori kaydedilemedi. Slug benzersiz olmalıdır.");
  }
}

export async function PATCH(request: Request) {
  const denied = await guardWrite();
  if (denied) return denied;

  const parsed = categoryUpdateSchema.safeParse(await readJson(request));
  if (!parsed.success) return badRequest(firstIssue(parsed.error));
  const input = parsed.data;

  try {
    const result = db
      .prepare(
        "UPDATE categories SET name=?,slug=?,image=?,active=?,sort_order=? WHERE id=?",
      )
      .run(
        input.name,
        input.slug,
        input.image,
        input.active ? 1 : 0,
        input.sortOrder,
        input.id,
      );
    if (!result.changes) return badRequest("Kategori bulunamadı.", 404);
    return NextResponse.json({ ok: true });
  } catch {
    return badRequest("Kategori güncellenemedi. Slug benzersiz olmalıdır.");
  }
}

export async function DELETE(request: Request) {
  const denied = await guardWrite();
  if (denied) return denied;

  const parsed = idSchema.safeParse(await readJson(request));
  if (!parsed.success) return badRequest("Geçersiz kategori.");

  const used = categoryProductCount(parsed.data.id);
  if (used > 0) {
    return badRequest(
      `Bu kategoride ${used} ürün bulunuyor. Önce ürünleri başka kategoriye taşıyın.`,
      409,
    );
  }

  const result = db.prepare("DELETE FROM categories WHERE id=?").run(parsed.data.id);
  if (!result.changes) return badRequest("Kategori bulunamadı.", 404);

  return NextResponse.json({ ok: true });
}
