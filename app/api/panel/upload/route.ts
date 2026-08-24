import { NextResponse } from "next/server";
import { uploadToImgBB } from "@/lib/images";
import { guard } from "@/lib/panel-api";
export const runtime = "nodejs";
export async function POST(request: Request) { const denied = await guard(); if (denied) return denied; try { const file = (await request.formData()).get("file"); if (!(file instanceof File)) return NextResponse.json({ error: "Görsel dosyası bulunamadı." }, { status: 400 }); const result = await uploadToImgBB(file); return "error" in result ? NextResponse.json({ error: result.error }, { status: result.status }) : NextResponse.json(result); } catch { return NextResponse.json({ error: "Görsel dosyası okunamadı." }, { status: 400 }); } }
