import { NextResponse } from "next/server";
import { createUploadSignature } from "@/lib/cloudinary";
import { guard, readJson } from "@/lib/panel-api";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(request: Request) { const denied = await guard(); if (denied) return denied; const body = await readJson(request) as { slug?: unknown } | null; if (typeof body?.slug !== "string") return NextResponse.json({ error: "Ürün slug'ı gerekli." }, { status: 400 }); try { return NextResponse.json(createUploadSignature(body.slug)); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Cloudinary imzası oluşturulamadı." }, { status: 503 }); } }
