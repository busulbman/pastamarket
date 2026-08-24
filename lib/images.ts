import "server-only";
import { readImgBBApiKey } from "@/lib/config";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);

export type UploadResult = { url: string } | { error: string; status: number };

export async function uploadToImgBB(file: File): Promise<UploadResult> {
  if (!TYPES.has(file.type.toLowerCase()) || !EXTENSIONS.has(file.name.split(".").pop()?.toLowerCase() ?? "")) {
    return { error: "Yalnızca JPG, PNG veya WebP görselleri yükleyebilirsiniz.", status: 415 };
  }
  if (!file.size) return { error: "Geçerli bir görsel seçin.", status: 400 };
  if (file.size > MAX_UPLOAD_BYTES) return { error: "Görsel boyutu en fazla 10 MB olabilir.", status: 413 };
  const key = readImgBBApiKey();
  if (!key) return { error: "Görsel yükleme henüz yapılandırılmadı.", status: 503 };
  const body = new FormData();
  body.set("image", file, file.name);
  try {
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(key)}`, { method: "POST", body, cache: "no-store" });
    const data = await response.json().catch(() => null) as { success?: boolean; data?: { display_url?: string; url?: string } } | null;
    const url = data?.data?.display_url ?? data?.data?.url;
    if (!response.ok || !data?.success || !url || !url.startsWith("https://")) return { error: "Görsel yüklenemedi. Lütfen tekrar deneyin.", status: 502 };
    return { url };
  } catch { return { error: "Görsel servisine ulaşılamadı. İnternet bağlantınızı kontrol edip tekrar deneyin.", status: 502 }; }
}
