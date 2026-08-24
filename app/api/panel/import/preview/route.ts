import { NextResponse } from "next/server";
import { categories } from "@/lib/data";
import { parseProductCsv, validateCsvRows } from "@/lib/csv-import";
import { guard } from "@/lib/panel-api";
export const runtime = "nodejs";
export async function POST(request: Request) { const denied = await guard(); if (denied) return denied; try { const file = (await request.formData()).get("file"); if (!(file instanceof File) || file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "En fazla 5 MB CSV dosyası yükleyin." }, { status: 400 }); const rows = parseProductCsv(await file.text()); if (rows.length > 500) return NextResponse.json({ error: "Bir seferde en fazla 500 satır aktarılabilir." }, { status: 400 }); const preview = validateCsvRows(rows, await categories(false)); return NextResponse.json({ rows: preview, valid: preview.filter((row) => !row.errors.length).length, invalid: preview.filter((row) => row.errors.length).length }); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "CSV okunamadı." }, { status: 400 }); } }
