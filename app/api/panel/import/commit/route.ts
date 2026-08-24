import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { writes } from "@/lib/data";
import { guard, readJson } from "@/lib/panel-api";
import { z } from "zod";
export const runtime = "nodejs";
const row = z.object({ rowNumber: z.number().int().positive(), name: z.string().max(200), slug: z.string().max(200), category_slug: z.string().max(120), price: z.string().max(40), compare_at_price: z.string().max(40), brand: z.string().max(120), weight: z.string().max(60), description: z.string().max(4000), active: z.string().max(20), image_filename: z.string().max(260) });
export async function POST(request: Request) { const denied = await guard(); if (denied) return denied; const parsed = z.object({ rows: z.array(row).min(1).max(500) }).safeParse(await readJson(request)); if (!parsed.success) return NextResponse.json({ error: "Aktarılacak satırlar geçersiz." }, { status: 400 }); try { const result = await (await writes()).bulkImportProducts(parsed.data.rows); revalidateTag("catalog"); return NextResponse.json(result); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Toplu aktarım tamamlanamadı." }, { status: 400 }); } }
