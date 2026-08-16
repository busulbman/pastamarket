import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { badRequest, guardWrite, readJson } from "@/lib/panel-api";
import { firstIssue, orderStatusSchema } from "@/lib/panel-schemas";

// better-sqlite3 native bir modüldür; Edge runtime desteklemez.
export const runtime = "nodejs";

export async function PATCH(request: Request) {
  const denied = await guardWrite();
  if (denied) return denied;

  const parsed = orderStatusSchema.safeParse(await readJson(request));
  if (!parsed.success) return badRequest(firstIssue(parsed.error));

  const result = db
    .prepare("UPDATE orders SET status=? WHERE id=?")
    .run(parsed.data.status, parsed.data.id);
  if (!result.changes) return badRequest("Sipariş bulunamadı.", 404);

  return NextResponse.json({ ok: true });
}
