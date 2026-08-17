import { NextResponse } from "next/server";
import { categories, countProducts, providerName } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Veri kaynağının gerçekten okunabildiğini doğrular.
 * Aktif sağlayıcı üzerinden çalışır: JSON modunda kataloğu, SQLite modunda
 * veritabanını okur. Hata durumunda 503 döner.
 */
export async function GET() {
  try {
    const [categoryList, productCount] = await Promise.all([
      categories(),
      countProducts(),
    ]);

    return NextResponse.json({
      ok: true,
      provider: providerName,
      categories: categoryList.length,
      products: productCount,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        provider: providerName,
        error: error instanceof Error ? error.message : "Veri kaynağı okunamadı.",
      },
      { status: 503 },
    );
  }
}
