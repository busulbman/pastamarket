import { NextResponse } from "next/server";
import { getWrites } from "@/lib/data";
import { badRequest, guardWrite, readJson } from "@/lib/panel-api";
import { firstIssue, orderStatusSchema } from "@/lib/panel-schemas";

// better-sqlite3 native bir modüldür; Edge runtime desteklemez.
export const runtime = "nodejs";
// SQLite yalnızca yazma izni olduğunda dinamik olarak yüklenir.
// DATA_PROVIDER=json iken guardWrite() 403 döndürür ve bu import hiç çalışmaz.

export async function PATCH(request: Request) {
  const denied = await guardWrite();
  if (denied) return denied;

  const writes = await getWrites();

  const parsed = orderStatusSchema.safeParse(await readJson(request));
  if (!parsed.success) return badRequest(firstIssue(parsed.error));

  if (!writes.setOrderStatus(parsed.data.id, parsed.data.status)) {
    return badRequest("Sipariş bulunamadı.", 404);
  }

  return NextResponse.json({ ok: true });
}
