import { NextResponse } from "next/server";
import { z } from "zod";
import { getWrites } from "@/lib/data";
import { badRequest, guardWrite, readJson } from "@/lib/panel-api";

// better-sqlite3 native bir modüldür; Edge runtime desteklemez.
export const runtime = "nodejs";
// SQLite yalnızca yazma izni olduğunda dinamik olarak yüklenir.
// DATA_PROVIDER=json iken guardWrite() 403 döndürür ve bu import hiç çalışmaz.

const schema = z.object({
  id: z.coerce.number().int().positive(),
  active: z.boolean(),
});

/** Ürünü hızlıca aktif/pasif yapar (liste ekranındaki anahtar). */
export async function PATCH(request: Request) {
  const denied = await guardWrite();
  if (denied) return denied;

  const writes = await getWrites();

  const parsed = schema.safeParse(await readJson(request));
  if (!parsed.success) return badRequest("Geçersiz istek.");

  if (!writes.setProductActive(parsed.data.id, parsed.data.active)) {
    return badRequest("Ürün bulunamadı.", 404);
  }

  return NextResponse.json({ ok: true });
}
