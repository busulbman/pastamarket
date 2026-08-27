import { NextResponse } from "next/server";
import { products } from "@/lib/data";
import { guard } from "@/lib/panel-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const denied = await guard();
  if (denied) return denied;

  const list = await products({ includeInactive: true, sort: "name" });
  return NextResponse.json({
    products: list.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      active: product.active,
      imageUrl: product.imageUrl || product.mainImage || "",
      imagePublicId: product.imagePublicId || "",
    })),
  }, { headers: { "Cache-Control": "no-store" } });
}
