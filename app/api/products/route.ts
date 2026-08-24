import { NextResponse } from "next/server";
import { productPage } from "@/lib/data";
export const runtime = "nodejs";
export async function GET(request: Request) { const url = new URL(request.url); const category = url.searchParams.get("category") || undefined; const cursor = url.searchParams.get("cursor") || undefined; const tag = url.searchParams.get("tag") === "best" ? "best" : url.searchParams.get("tag") === "new" ? "new" : undefined; const brand = url.searchParams.get("brand") || undefined; const page = await productPage({ category, tag, brand, cursor, limit: 24 }); return NextResponse.json(page, { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } }); }
