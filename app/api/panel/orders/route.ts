import { NextResponse } from "next/server";
import { writes } from "@/lib/data";
import { badRequest, guard, readJson } from "@/lib/panel-api";
import { firstIssue, orderStatusSchema } from "@/lib/panel-schemas";
export const runtime = "nodejs";
export async function PATCH(request: Request) { const denied = await guard(); if (denied) return denied; const input = orderStatusSchema.safeParse(await readJson(request)); if (!input.success) return badRequest(firstIssue(input.error)); const ok = await (await writes()).setOrderStatus(input.data.id, input.data.status); return ok ? NextResponse.json({ ok: true }) : badRequest("Sipariş bulunamadı.", 404); }
