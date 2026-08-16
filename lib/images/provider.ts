/**
 * Görsel yükleme sağlayıcısı arayüzü.
 *
 * Bugün tek uygulama "local" (public/uploads). İleride IMAGE_PROVIDER=imgbb
 * için bu arayüzü uygulayan yeni bir dosya eklenir; panel arayüzü ve
 * /api/panel/upload route'u değişmez.
 */
export type UploadResult = { url: string };

export type UploadError = { error: string; status: number };

export interface ImageProvider {
  readonly name: string;
  upload(file: File): Promise<UploadResult | UploadError>;
}

export const isUploadError = (
  value: UploadResult | UploadError,
): value is UploadError => "error" in value;

/** Kabul edilen tipler ve sınırlar her sağlayıcı için ortaktır. */
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB

export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif"]);

/**
 * Dosyayı sağlayıcıdan bağımsız olarak doğrular:
 * MIME türü, uzantı ve boyut. Hepsi sunucu tarafında kontrol edilir.
 */
export function validateImageFile(file: File): UploadError | null {
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Geçerli bir dosya seçin.", status: 400 };
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return { error: "Dosya boyutu en fazla 8 MB olabilir.", status: 413 };
  }

  const mime = (file.type || "").toLowerCase();
  if (!ALLOWED_IMAGE_TYPES[mime]) {
    return {
      error: "Yalnızca JPEG, PNG, WEBP ve GIF görselleri yüklenebilir.",
      status: 415,
    };
  }

  // Uzantı da ayrıca doğrulanır; MIME başlığı istemciden gelir ve taklit edilebilir.
  const extension = (file.name.split(".").pop() || "").toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(extension)) {
    return {
      error: "Dosya uzantısı desteklenmiyor (jpg, png, webp, gif).",
      status: 415,
    };
  }

  return null;
}
