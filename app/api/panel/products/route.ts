import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { writes } from "@/lib/data";
import { badRequest, guard, readJson } from "@/lib/panel-api";
import { firstIssue, idSchema, productSchema, productUpdateSchema } from "@/lib/panel-schemas";
export const runtime = "nodejs";
const refresh = () => revalidateTag("catalog");
export async function POST(request: Request) { const denied = await guard(); if (denied) return denied; const input = productSchema.safeParse(await readJson(request)); if (!input.success) return badRequest(firstIssue(input.error)); try { const id = await (await writes()).createProduct(input.data); refresh(); return NextResponse.json({ id }); } catch (error) { return badRequest(error instanceof Error ? error.message : "Ürün kaydedilemedi."); } }
export async function PATCH(request: Request) { const denied = await guard(); if (denied) return denied; const input = productUpdateSchema.safeParse(await readJson(request)); if (!input.success) return badRequest(firstIssue(input.error)); try { await (await writes()).updateProduct(input.data.id, input.data); refresh(); return NextResponse.json({ ok: true }); } catch (error) { return badRequest(error instanceof Error ? error.message : "Ürün güncellenemedi."); } }
export async function DELETE(request: Request) { const denied = await guard(); if (denied) return denied; const input = idSchema.safeParse(await readJson(request)); if (!input.success) return badRequest("Geçersiz ürün."); try { const deleted = await (await writes()).deleteProduct(input.data.id); if (!deleted) return badRequest("Ürün bulunamadı.", 404); refresh(); return NextResponse.json({ ok: true }); } catch (error) { return badRequest(error instanceof Error ? error.message : "Ürün silinemedi.", 409); } }
