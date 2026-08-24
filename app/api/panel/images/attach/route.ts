import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { writes } from "@/lib/data";
import { CLOUDINARY_FOLDER } from "@/lib/cloudinary";
import { config, readCloudinaryConfig } from "@/lib/config";
import { guard, readJson } from "@/lib/panel-api";
import { z } from "zod";
export const runtime = "nodejs";
const schema = z.object({ slug: z.string().regex(/^[a-z0-9-]{2,200}$/), url: z.string().url().max(600), publicId: z.string().startsWith(`${CLOUDINARY_FOLDER}/`).max(300), width: z.number().int().positive(), height: z.number().int().positive(), bytes: z.number().int().positive().max(10 * 1024 * 1024) });
export async function POST(request: Request) { const denied = await guard(); if (denied) return denied; const input = schema.safeParse(await readJson(request)); if (!input.success) return NextResponse.json({ error: "Görsel bilgileri geçersiz." }, { status: 400 }); const cloudinary = readCloudinaryConfig(); if (config.imageProvider !== "cloudinary" || !cloudinary) return NextResponse.json({ error: "Cloudinary görsel yükleme yapılandırılmadı." }, { status: 503 }); const expectedPrefix = `https://res.cloudinary.com/${cloudinary.cloudName}/`; if (!input.data.url.startsWith(expectedPrefix)) return NextResponse.json({ error: "Görsel Cloudinary güvenli URL'si olmalıdır." }, { status: 400 }); try { const result = await (await writes()).attachProductImage(input.data.slug, input.data); revalidateTag("catalog"); return NextResponse.json(result); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Görsel ürünle eşleştirilemedi." }, { status: 400 }); } }
