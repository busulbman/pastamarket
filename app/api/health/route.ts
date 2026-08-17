import { NextResponse } from "next/server";
import { providerName, providerWritable } from "@/lib/data";
import { demoReadOnly } from "@/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Hafif sağlık kontrolü.
 * Veritabanına, JSON kataloğuna veya dosya sistemine HİÇ dokunmaz —
 * yalnızca yapılandırmayı raporlar.
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    provider: providerName,
    writable: providerWritable,
    demoReadOnly,
  });
}
