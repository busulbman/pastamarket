import { NextResponse } from "next/server";
import { updateSettings } from "@/lib/db";
import { badRequest, guardWrite, readJson } from "@/lib/panel-api";
import { pickSettings } from "@/lib/panel-schemas";

// better-sqlite3 native bir modüldür; Edge runtime desteklemez.
export const runtime = "nodejs";

export async function PATCH(request: Request) {
  const denied = await guardWrite();
  if (denied) return denied;

  // Yalnızca bilinen ayar anahtarları yazılır; gövdeye eklenen
  // rastgele anahtarlar (ör. catalog_version) yok sayılır.
  const values = pickSettings(await readJson(request));
  if (!Object.keys(values).length) return badRequest("Güncellenecek ayar bulunamadı.");

  updateSettings(values);
  return NextResponse.json({ ok: true });
}
