import { NextResponse } from "next/server";
import { checkoutSchema, createOrder } from "@/lib/order";
import { blockDemoWrite } from "@/lib/demo-guard";

// better-sqlite3 native bir modüldür; Edge runtime desteklemez.
export const runtime = "nodejs";

export async function POST(request: Request) {
  // Canlı demoda sipariş veritabanına yazılmaz.
  const demoBlocked = blockDemoWrite();
  if (demoBlocked) return demoBlocked;

  try {
    const parsed = checkoutSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Lütfen zorunlu alanları ve sepetinizi kontrol edin.",
          issues: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    return NextResponse.json(await createOrder(parsed.data));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Sipariş oluşturulamadı." },
      { status: 400 },
    );
  }
}
