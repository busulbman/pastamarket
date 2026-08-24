export type UploadedCloudinaryAsset = { url: string; publicId: string; width: number; height: number; bytes: number };
const maxBytes = 10 * 1024 * 1024;
const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);
export function validateClientImage(file: File) {
  if (!allowed.has(file.type.toLowerCase())) return "Yalnızca JPG, PNG veya WebP görselleri yükleyebilirsiniz.";
  if (!file.size) return "Geçerli bir görsel seçin.";
  if (file.size > maxBytes) return "Görsel boyutu en fazla 10 MB olabilir.";
  return null;
}
export async function uploadCloudinary(file: File, slug: string): Promise<UploadedCloudinaryAsset> {
  const validation = validateClientImage(file); if (validation) throw new Error(validation);
  const signed = await fetch("/api/panel/images/sign", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug }) });
  const signature = await signed.json().catch(() => ({}));
  if (!signed.ok) throw new Error(signature.error || "Cloudinary imzası oluşturulamadı.");
  if (Date.now() >= signature.expiresAt) throw new Error("Yükleme imzasının süresi doldu. Lütfen tekrar deneyin.");
  const body = new FormData(); body.set("file", file); body.set("api_key", signature.apiKey); body.set("timestamp", String(signature.timestamp)); body.set("signature", signature.signature); body.set("folder", signature.folder); body.set("public_id", signature.publicId); body.set("overwrite", "true"); body.set("unique_filename", "false");
  const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(signature.cloudName)}/image/upload`, { method: "POST", body });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.secure_url || !data.public_id) throw new Error(data.error?.message || "Cloudinary görsel yüklemesi başarısız oldu.");
  return { url: data.secure_url, publicId: data.public_id, width: Number(data.width) || 0, height: Number(data.height) || 0, bytes: Number(data.bytes) || file.size };
}
