import Image from "next/image";
import { isLocalPath, PRODUCT_PLACEHOLDER } from "@/lib/image-paths";

/**
 * Ürün, kategori ve içerik görselleri. Saf sunum bileşenidir; dosya sistemine
 * erişmediği için hem sunucu hem istemci bileşenlerinden kullanılabilir.
 *
 * Gelen yolun diskte var olup olmadığı veri katmanında (lib/db.ts →
 * resolveImageSrc) çözülür ve eksikse zaten placeholder gelir. Burada ek
 * güvenlik olarak yerel olmayan her adres de placeholder'a düşürülür; böylece
 * dış kaynağa (Unsplash vb.) hiçbir istek gitmez ve hata döngüsü oluşmaz.
 */
export function ProductImage({
  src,
  alt,
  width,
  height,
  className,
  sizes,
  priority = false,
}: {
  src?: string | null;
  alt: string;
  width: number;
  height: number;
  className?: string;
  sizes?: string;
  /** İlk ekrandaki önemli görsellerde true; diğerleri lazy yüklenir. */
  priority?: boolean;
}) {
  const value = (src ?? "").trim();
  const resolved = isLocalPath(value) ? value : PRODUCT_PLACEHOLDER;
  const isPlaceholder = resolved === PRODUCT_PLACEHOLDER;

  // SVG placeholder next/image ile optimize edilmez, olduğu gibi sunulur.
  if (isPlaceholder) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={PRODUCT_PLACEHOLDER}
        alt={alt || "Ürün görseli henüz eklenmedi"}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={className}
      />
    );
  }

  return (
    <Image
      src={resolved}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      loading={priority ? undefined : "lazy"}
      className={className}
    />
  );
}
