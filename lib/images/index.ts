import { config } from "@/lib/config";
import { localImageProvider } from "@/lib/images/local";
import type { ImageProvider } from "@/lib/images/provider";

/**
 * Aktif görsel sağlayıcısını döner.
 * ImgBB eklenirken buraya `case "imgbb": return imgbbImageProvider;` satırı
 * eklenecek, çağıran taraflar (panel formu ve upload route'u) değişmeyecek.
 */
export function getImageProvider(): ImageProvider {
  switch (config.imageProvider) {
    case "local":
    default:
      return localImageProvider;
  }
}

export * from "@/lib/images/provider";
