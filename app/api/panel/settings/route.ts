import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { writes } from "@/lib/data";
import { badRequest, guard, readJson } from "@/lib/panel-api";
import { pickSettings } from "@/lib/panel-schemas";
export const runtime = "nodejs";
export async function PATCH(request: Request) { const denied = await guard(); if (denied) return denied; const values = pickSettings(await readJson(request)); if (!Object.keys(values).length) return badRequest("Güncellenecek ayar bulunamadı."); await (await writes()).updateSettings(values); revalidateTag("catalog"); return NextResponse.json({ ok: true }); }
