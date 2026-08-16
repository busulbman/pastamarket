/**
 * Şanti / krema kataloğu.
 *
 * Yalnızca verilen bilgiler yazılır: ad, slug, kategori, fiyat (TL) ve görsel yolu.
 * Gramaj, açıklama, eski fiyat, rozet ve varyasyon bilgisi verilmediği için
 * bilerek boş/null bırakılmıştır — uydurulmaz.
 *
 * Kayıtlar slug ile eşleştirilir; tekrar çalıştırıldığında kopya oluşmaz.
 */

export type CatalogCategory = { name: string; slug: string };

export type CatalogProduct = {
  slug: string;
  name: string;
  categorySlug: string;
  /** Türk lirası cinsinden fiyat (veritabanı REAL olarak TL saklar). */
  price: number;
  image: string;
};

export const SANTI_CATEGORIES: CatalogCategory[] = [
  { name: "Sıvı Şanti", slug: "sivi-santi" },
  { name: "Toz Şanti ve Toz Krema", slug: "toz-santi-ve-toz-krema" },
];

export const SANTI_PRODUCTS: CatalogProduct[] = [
  // --- Sıvı Şanti ---
  {
    slug: "hopla-sivi-santi-sekerli",
    name: "Hopla Sıvı Şanti Şekerli",
    categorySlug: "sivi-santi",
    price: 210,
    image: "/images/products/hopla-sivi-santi-sekerli.jpg",
  },
  {
    slug: "samara-sivi-santi",
    name: "Samara Sıvı Şanti",
    categorySlug: "sivi-santi",
    price: 160,
    image: "/images/products/samara-sivi-santi.jpg",
  },
  {
    slug: "perfect-sivi-santi",
    name: "Perfect Sıvı Şanti",
    categorySlug: "sivi-santi",
    price: 180,
    image: "/images/products/perfect-sivi-santi.jpg",
  },
  {
    slug: "hopla-sekersiz-santi",
    name: "Hopla Şekersiz Şanti",
    categorySlug: "sivi-santi",
    price: 210,
    image: "/images/products/hopla-sekersiz-santi.jpg",
  },
  {
    slug: "samara-sekersiz-santi",
    name: "Samara Şekersiz Şanti",
    categorySlug: "sivi-santi",
    price: 160,
    image: "/images/products/samara-sekersiz-santi.jpg",
  },

  // --- Toz Şanti ve Toz Krema ---
  {
    slug: "dondo-toz-krem-santi",
    name: "Dondo Toz Krem Şanti",
    categorySlug: "toz-santi-ve-toz-krema",
    price: 280,
    image: "/images/products/dondo-toz-krem-santi.jpg",
  },
  {
    slug: "meister-toz-krem-santi",
    name: "Meister Toz Krem Şanti",
    categorySlug: "toz-santi-ve-toz-krema",
    price: 250,
    image: "/images/products/meister-toz-krem-santi.jpg",
  },
  {
    slug: "ovalette-toz-santi",
    name: "Ovalette Toz Şanti",
    categorySlug: "toz-santi-ve-toz-krema",
    price: 300,
    image: "/images/products/ovalette-toz-santi.jpg",
  },
  {
    slug: "tatki-toz-krem-santi",
    name: "Tatki Toz Krem Şanti",
    categorySlug: "toz-santi-ve-toz-krema",
    price: 260,
    image: "/images/products/tatki-toz-krem-santi.jpg",
  },
  {
    slug: "ovalette-toz-krema",
    name: "Ovalette Toz Krema",
    categorySlug: "toz-santi-ve-toz-krema",
    price: 250,
    image: "/images/products/ovalette-toz-krema.jpg",
  },
  {
    slug: "fiero-toz-krema",
    name: "Fiero Toz Krema",
    categorySlug: "toz-santi-ve-toz-krema",
    price: 250,
    image: "/images/products/fiero-toz-krema.jpg",
  },
  {
    slug: "meister-toz-krema",
    name: "Meister Toz Krema",
    categorySlug: "toz-santi-ve-toz-krema",
    price: 245,
    image: "/images/products/meister-toz-krema.jpg",
  },
];
