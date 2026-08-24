import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { writes } from "@/lib/data";
import { badRequest, guard, readJson } from "@/lib/panel-api";
import { idSchema } from "@/lib/panel-schemas";
export const runtime = "nodejs";
export async function PATCH(request: Request) { const denied = await guard(); if (denied) return denied; const payload = await readJson(request) as { id?: unknown; active?: unknown }; const parsed = idSchema.safeParse(payload); if (!parsed.success || typeof payload?.active !== "boolean") return badRequest("Geçersiz ürün durumu."); const ok = await (await writes()).setProductActive(parsed.data.id, payload.active); if (!ok) return badRequest("Ürün bulunamadı.", 404); revalidateTag("catalog"); return NextResponse.json({ ok: true }); }
