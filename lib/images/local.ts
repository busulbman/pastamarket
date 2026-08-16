import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { config } from "@/lib/config";
import {
  ALLOWED_IMAGE_TYPES,
  validateImageFile,
  type ImageProvider,
  type UploadError,
  type UploadResult,
} from "@/lib/images/provider";

/**
 * DEMO / YEREL KULLANIM İÇİNDİR.
 *
 * Görseller sunucunun dosya sistemine (public/uploads) yazılır. Bu yaklaşım
 * yalnızca tek makinede çalışan demo ve geliştirme ortamı içindir:
 * Vercel gibi salt-okunur/efemer dosya sistemine sahip ortamlarda kalıcı
 * değildir. Üretimde IMAGE_PROVIDER=imgbb (veya benzeri) sağlayıcıya geçilmelidir.
 */

/** Dosya adı istemciden geldiği hâliyle asla kullanılmaz. */
function safeFileName(mime: string) {
  const extension = ALLOWED_IMAGE_TYPES[mime.toLowerCase()] || "jpg";
  return `${Date.now()}-${crypto.randomUUID()}.${extension}`;
}

export const localImageProvider: ImageProvider = {
  name: "local",

  async upload(file: File): Promise<UploadResult | UploadError> {
    const invalid = validateImageFile(file);
    if (invalid) return invalid;

    const directory = path.resolve(process.cwd(), config.uploadDir);
    const name = safeFileName(file.type);
    const target = path.resolve(directory, name);

    // Path traversal koruması: hedef her koşulda upload dizininin içinde kalmalı.
    // (Ad zaten sunucuda üretiliyor; bu kontrol ikinci savunma hattıdır.)
    const relative = path.relative(directory, target);
    if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
      return { error: "Geçersiz dosya yolu.", status: 400 };
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    // İstemcinin bildirdiği boyut değil, gerçekte okunan boyut da doğrulanır.
    const sizeCheck = validateImageFile(
      new File([bytes], file.name, { type: file.type }),
    );
    if (sizeCheck) return sizeCheck;

    await fs.mkdir(directory, { recursive: true });
    await fs.writeFile(target, bytes, { mode: 0o644 });

    return { url: `/uploads/${name}` };
  },
};
