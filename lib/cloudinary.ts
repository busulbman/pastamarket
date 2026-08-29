import "server-only";
import crypto from "node:crypto";
import { config, readCloudinaryConfig } from "@/lib/config";

export const CLOUDINARY_FOLDER = "pastamarket/products";
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);

export type CloudinaryAsset = { url: string; publicId: string; width: number; height: number; bytes: number };

export function imageUploadError(file: File) {
  if (!TYPES.has(file.type.toLowerCase()) || !EXTENSIONS.has(file.name.split(".").pop()?.toLowerCase() ?? "")) return "Yalnızca JPG, PNG veya WebP görselleri yükleyebilirsiniz.";
  if (!file.size) return "Geçerli bir görsel seçin.";
  if (file.size > MAX_IMAGE_BYTES) return "Görsel boyutu en fazla 10 MB olabilir.";
  return null;
}

export function productPublicId(slug: string) {
  const clean = slug.trim().toLocaleLowerCase("tr-TR").replace(/[^a-z0-9-]/g, "");
  if (!clean || clean.length > 200) throw new Error("Geçerli bir ürün slug'ı gerekli.");
  return `${CLOUDINARY_FOLDER}/${clean}`;
}

function newProductAssetId(slug: string, timestamp: number) {
  const productId = productPublicId(slug).slice(`${CLOUDINARY_FOLDER}/`.length);
  return `${productId}-${timestamp}-${crypto.randomUUID().replaceAll("-", "").slice(0, 12)}`;
}

function signature(parameters: Record<string, string | number>, secret: string) {
  const text = Object.entries(parameters).sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => `${key}=${value}`).join("&");
  return crypto.createHash("sha1").update(`${text}${secret}`).digest("hex");
}

export function createUploadSignature(slug: string) {
  if (config.imageProvider !== "cloudinary") throw new Error("Görsel sağlayıcısı Cloudinary olarak yapılandırılmadı.");
  const credentials = readCloudinaryConfig();
  if (!credentials) throw new Error("Cloudinary yapılandırması eksik.");
  const timestamp = Math.floor(Date.now() / 1000);
  const params = { folder: CLOUDINARY_FOLDER, public_id: newProductAssetId(slug, timestamp), overwrite: "false", unique_filename: "false", timestamp };
  return { cloudName: credentials.cloudName, apiKey: credentials.apiKey, timestamp, signature: signature(params, credentials.apiSecret), folder: params.folder, publicId: params.public_id, expiresAt: (timestamp + 600) * 1000 };
}

export async function deleteCloudinaryAsset(publicId: string) {
  if (config.imageProvider !== "cloudinary") throw new Error("Görsel sağlayıcısı Cloudinary olarak yapılandırılmadı.");
  if (!publicId.startsWith(`${CLOUDINARY_FOLDER}/`) || publicId.includes("..")) throw new Error("Yalnızca PastaMarket ürün görselleri silinebilir.");
  const credentials = readCloudinaryConfig();
  if (!credentials) throw new Error("Cloudinary yapılandırması eksik.");
  const timestamp = Math.floor(Date.now() / 1000);
  const params = { invalidate: "true", public_id: publicId, timestamp };
  const body = new URLSearchParams({
    invalidate: params.invalidate,
    public_id: params.public_id,
    timestamp: String(params.timestamp),
    api_key: credentials.apiKey,
    signature: signature(params, credentials.apiSecret),
  });
  const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(credentials.cloudName)}/image/destroy`, { method: "POST", body, cache: "no-store" });
  if (!response.ok) throw new Error("Eski görsel Cloudinary'den silinemedi.");
  const data = await response.json().catch(() => null) as { result?: string } | null;
  if (data?.result !== "ok" && data?.result !== "not found") throw new Error("Eski görsel Cloudinary'den silinemedi.");
}
