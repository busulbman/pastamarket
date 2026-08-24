import { NextResponse } from "next/server";
import { deleteCloudinaryAsset } from "@/lib/cloudinary";
import { guard, readJson } from "@/lib/panel-api";
export const runtime = "nodejs";
export async function POST(request: Request) { const denied = await guard(); if (denied) return denied; const body = await readJson(request) as { publicId?: unknown } | null; if (typeof body?.publicId !== "string") return NextResponse.json({ error: "Görsel kimliği gerekli." }, { status: 400 }); try { await deleteCloudinaryAsset(body.publicId); return NextResponse.json({ ok: true }); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Görsel silinemedi." }, { status: 400 }); } }
