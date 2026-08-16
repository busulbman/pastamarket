import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { badRequest, guardWrite, readJson } from "@/lib/panel-api";

// better-sqlite3 native bir modüldür; Edge runtime desteklemez.
export const runtime = "nodejs";

const schema = z.object({
  id: z.coerce.number().int().positive(),
  active: z.boolean(),
});

/** Ürünü hızlıca aktif/pasif yapar (liste ekranındaki anahtar). */
export async function PATCH(request: Request) {
  const denied = await guardWrite();
  if (denied) return denied;

  const parsed = schema.safeParse(await readJson(request));
  if (!parsed.success) return badRequest("Geçersiz istek.");

  const result = db
    .prepare("UPDATE products SET active=? WHERE id=?")
    .run(parsed.data.active ? 1 : 0, parsed.data.id);
  if (!result.changes) return badRequest("Ürün bulunamadı.", 404);

  return NextResponse.json({ ok: true });
}
