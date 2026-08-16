import { NextResponse } from "next/server";
import { demoReadOnly } from "@/lib/config";

/**
 * Canlı demo yazma kilidi.
 *
 * DEMO_READ_ONLY=true iken veritabanına yazan tüm uçlar kapatılır.
 * Yerel geliştirmede bu bayrak tanımsız olduğu için hiçbir etkisi yoktur.
 */
export const DEMO_WRITE_MESSAGE =
  "Demo sürümünde değişiklikler kapalıdır. Kalıcı yönetim Firebase ve ImgBB bağlantısından sonra aktif olacaktır.";

export { demoReadOnly };

/** Demo modunda 403 döner; değilse null döner ve akış devam eder. */
export function blockDemoWrite() {
  return demoReadOnly
    ? NextResponse.json({ error: DEMO_WRITE_MESSAGE, demoReadOnly: true }, { status: 403 })
    : null;
}
