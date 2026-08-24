import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export const unauthorized = () => NextResponse.json({ error: "Bu işlem için giriş yapmalısınız." }, { status: 401 });
export const badRequest = (error: string, status = 400) => NextResponse.json({ error }, { status });
export async function guard() { return (await requireAdmin()) ? null : unauthorized(); }
export async function readJson(request: Request) { try { return await request.json() as unknown; } catch { return null; } }
