import { NextResponse } from "next/server";
import { getImageProvider, isUploadError } from "@/lib/images";
import { guardWrite } from "@/lib/panel-api";

// better-sqlite3 native bir modüldür; Edge runtime desteklemez.
export const runtime = "nodejs";

/**
 * Görsel yükleme. Aktif sağlayıcı IMAGE_PROVIDER ile seçilir; doğrulama
 * (MIME, uzantı, boyut) ve dosya adı üretimi sağlayıcı katmanındadır.
 */
export async function POST(request: Request) {
  const denied = await guardWrite();
  if (denied) return denied;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Dosya okunamadı." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 400 });
  }

  const result = await getImageProvider().upload(file);
  if (isUploadError(result)) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ url: result.url });
}
